import {
  Connection,
  Logs,
  ParsedTransactionWithMeta,
  PartiallyDecodedInstruction,
  PublicKey,
} from "@solana/web3.js";
import { ProcessProgramLogs } from "./types";
import { findInstructionByProgramId } from "./utils";
import { Metaplex } from "@metaplex-foundation/js";

export class CreatedTokenProgramLogsHandler implements ProcessProgramLogs {
  private metaplex: Metaplex;

  constructor(
    private readonly connection: Connection,
    private readonly processProgramLogsCallBack: Function
  ) {
    this.metaplex = Metaplex.make(this.connection);
  }

  async processProgramLogs(programId: string, txLogs: Logs): Promise<any> {
    const data = await this.fetchAgentsLandLaunchInfo(
      programId,
      txLogs.signature
    );
    if (!data) return;
    await this.processProgramLogsCallBack(data);
    return data;
  }

  private async fetchAgentsLandLaunchInfo(
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
    }
    return this.parseTokenLaunchInfo(programId, tx);
  }

  private async parseTokenLaunchInfo(
    programId: string,
    txData: ParsedTransactionWithMeta
  ) {
    const initInstruction = findInstructionByProgramId(
      txData.transaction.message.instructions,
      new PublicKey(programId)
    ) as PartiallyDecodedInstruction | null;
    if (!initInstruction) {
      throw new Error("Failed to find lp init instruction in lp init tx");
    }
    console.dir(txData.meta?.innerInstructions, { depth: null });
    if (initInstruction.accounts.length < 5) {
      throw new Error("Instruction account length is too small");
    }
    const creator = initInstruction.accounts[2];
    const mintAddress = initInstruction.accounts[3];
    const bondingCurve = initInstruction.accounts[4];
    const token = await this.metaplex
      .nfts()
      .findByMint({ mintAddress: mintAddress }, { commitment: "confirmed" });
    return {
      creator,
      mintAddress,
      metadata: token,
      bondingCurve,
    };
  }
}
