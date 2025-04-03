import { Connection, Logs, PublicKey } from "@solana/web3.js";
import { ProcessProgramLogs, SubscibeProgramLogs } from "./types";
import { findLogEntry } from "./utils";
import { CreatedTokenProgramLogsHandler } from "./CreatedTokenHandler";
import { TokenSwapProgramHandler } from "./TokenSwapHandler";

export const ACCEPTED_NEEDLES = {
  LAUNCH: "Launch",
  SWAP: "Swap",
} as const;

export type AcceptedNeedle =
  (typeof ACCEPTED_NEEDLES)[keyof typeof ACCEPTED_NEEDLES];

export class AgentsLandListener implements SubscibeProgramLogs {
  constructor(
    private readonly connection: Connection,
    private seenTransactions: string[] = []
  ) { }

  private logHandlers: Record<string, ProcessProgramLogs> = {};
  setProgramLogsCallback(needle: AcceptedNeedle, callback: Function) {
    if (!needle || !callback) {
      throw new Error("Needle and / or callback is empty");
    }
    switch (needle) {
      case "Launch":
        this.logHandlers[needle] = new CreatedTokenProgramLogsHandler(
          this.connection,
          callback
        );
        break;
      case "Swap":
        this.logHandlers[needle] = new TokenSwapProgramHandler(
          this.connection,
          callback
        );
        break;
      default:
        throw new Error(`Needle ${needle} is not supported`);
    }
  }

  subscribeProgramLogs(programId: string): number {
    if (!programId) {
      console.error("Program Id is empty");
      return;
    }
    const subId = this.connection.onLogs(
      new PublicKey(programId),
      async (txLogs: Logs) => {
        if (!txLogs.signature) {
          console.error("tx logs has no signature");
          return;
        }
        if (!txLogs.logs) {
          console.error("tx logs has no logs");
          return;
        }
        if (this.seenTransactions.includes(txLogs.signature)) {
          return;
        }

        try {
          for (const [needle, handler] of Object.entries(this.logHandlers)) {
            if (!findLogEntry(needle, txLogs.logs)) continue;

            const data = await handler.processProgramLogs(programId, txLogs);
            console.log("Data subscribe program logs", data);
          }
        } catch (error) {
          // await this.connection.removeOnLogsListener(subId);
          console.error("err Created Token Log Listener: ", error);
        }
      },
      "confirmed"
    );
    console.log("Listening to new Agents.land tokens...");
    return subId;
  }
}
