import { AgentsLandListener } from "@/program/logListeners/AgentsLandListener";
import { Connection } from "@solana/web3.js";
import dotenv from "dotenv";
dotenv.config();

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC, {
  wsEndpoint: process.env.NEXT_PUBLIC_SOLANA_WS,
  commitment: "confirmed",
});
const listener = new AgentsLandListener(connection);

async function testListenToLogs() {
  listener.setProgramLogsCallback("Launch", (data: any) => {
    console.log("data: ", data);
  });
  listener.setProgramLogsCallback("Swap", (data: any) => {
    console.log("swap data: ", data);
  });
  listener.subscribeProgramLogs(process.env.NEXT_PUBLIC_PROGRAM_ID);
}

// testListenToLogs();
