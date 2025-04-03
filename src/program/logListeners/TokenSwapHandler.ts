import {
  Connection,
  LAMPORTS_PER_SOL,
  Logs,
  ParsedInnerInstruction,
  ParsedInstruction,
  ParsedTransactionWithMeta,
  PartiallyDecodedInstruction,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { ProcessProgramLogs } from "./types";
import { findInstructionByProgramId } from "./utils";
import { Metaplex } from "@metaplex-foundation/js";
import { GLOBAL_VAULT } from "./constants";
import { SwapInfo } from "@/utils/types";

export class TokenSwapProgramHandler implements ProcessProgramLogs {
  private metaplex: Metaplex;

  constructor(
    private readonly connection: Connection,
    private readonly processProgramLogsCallBack: Function
  ) {
    this.metaplex = Metaplex.make(this.connection);
  }

  async processProgramLogs(programId: string, txLogs: Logs): Promise<any> {
    console.log("tx logs: ", txLogs);
    const data = await this.fetchTokenSwapInfo(programId, txLogs.signature);
    if (!data) return;
    await this.processProgramLogsCallBack(data);
    return data;
  }

  private async fetchTokenSwapInfo(
    programId: string,
    txSignature: string
  ): Promise<any> {
    const tx = await this.connection.getParsedTransaction(txSignature, {
      commitment: "confirmed",
    });
    if (!tx) {
      console.error(
        "Failed to fetch transaction with signature " + txSignature
      );
      return;
    }
    return this.parseTokenSwapInfo(programId, tx);
  }

  private async parseTokenSwapInfo(
    programId: string,
    txData: ParsedTransactionWithMeta
  ) {
    const swapInstructions = findInstructionByProgramId(
      txData.transaction.message.instructions,
      new PublicKey(programId)
    ) as PartiallyDecodedInstruction | null;
    if (!swapInstructions) {
      throw new Error("Failed to find lp init instruction in lp init tx");
    }
    console.dir(txData.meta?.innerInstructions, { depth: null });
    if (swapInstructions.accounts.length < 8) {
      throw new Error("Instruction account length is too small");
    }
    // parse metadata - creator and mint address data
    const creator = swapInstructions.accounts[8];
    const mintAddress = swapInstructions.accounts[5];
    const token = await this.metaplex
      .nfts()
      .findByMint({ mintAddress: mintAddress }, { commitment: "confirmed" });

    // parse swap data - swap direction and SOL amount
    const [globalVaultPda, _] = PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_VAULT)],
      new PublicKey(programId)
    );
    let swapInfo: SwapInfo = {
      creator: creator.toBase58(),
      solAmountInLamports: 0,
      direction: "Sold",
      mintAddress: mintAddress.toBase58(),
      mintName: token.name,
      mintSymbol: token.symbol,
      mintUri: token.json.image || token.uri,
    };

    const soldInstruction = this.findSellSolInstruction(
      txData.meta?.innerInstructions,
      globalVaultPda
    );

    if (soldInstruction) {
      swapInfo.solAmountInLamports = soldInstruction.parsed.info.lamports;
      return swapInfo;
    }
    const boughtInstruction = this.findBuySolInstruction(
      txData.meta?.innerInstructions,
      globalVaultPda
    );
    if (boughtInstruction) {
      swapInfo.solAmountInLamports = boughtInstruction.parsed.info.lamports;
      swapInfo.direction = "Bought";
      return swapInfo;
    }
    return swapInfo;
  }

  private findSellSolInstruction(
    innerInstructions: Array<ParsedInnerInstruction> | undefined,
    globalVaultPda: PublicKey
  ): ParsedInstruction | null {
    if (!innerInstructions) {
      return null;
    }
    for (let i = 0; i < innerInstructions.length; i++) {
      for (let y = 0; y < innerInstructions[i].instructions.length; y++) {
        const instruction = innerInstructions[i].instructions[
          y
        ] as ParsedInstruction;
        if (!instruction.parsed) {
          continue;
        }
        if (
          this.isTransferSolInstruction(instruction) &&
          // send SOL to global vault -> buy token
          instruction.parsed.info.destination &&
          instruction.parsed.info.destination === globalVaultPda.toBase58()
        ) {
          return instruction;
        }
      }
    }

    return null;
  }

  private findBuySolInstruction(
    innerInstructions: Array<ParsedInnerInstruction> | undefined,
    globalVaultPda: PublicKey
  ): ParsedInstruction | null {
    if (!innerInstructions) {
      return null;
    }
    for (let i = 0; i < innerInstructions.length; i++) {
      for (let y = 0; y < innerInstructions[i].instructions.length; y++) {
        const instruction = innerInstructions[i].instructions[
          y
        ] as ParsedInstruction;
        if (!instruction.parsed) {
          continue;
        }
        if (
          this.isTransferSolInstruction(instruction) &&
          // send SOL to global vault -> buy token
          instruction.parsed.info.source &&
          instruction.parsed.info.source === globalVaultPda.toBase58()
        ) {
          return instruction;
        }
      }
    }

    return null;
  }

  private isTransferSolInstruction(instruction: ParsedInstruction): boolean {
    return (
      instruction.parsed.type === "transfer" &&
      instruction.program === "system" &&
      instruction.programId.toBase58() === SystemProgram.programId.toBase58()
    );
  }
}
