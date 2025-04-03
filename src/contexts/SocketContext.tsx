/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import { createContext, useState, useEffect, useContext } from "react";
import io, { Socket } from "socket.io-client";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from "next/navigation";
import { errorAlert, successAlert } from "@/components/others/ToastGroup";
import { coinInfo, msgInfo, tradeInfo } from "@/utils/types";
import UserContext from "@/context/UserContext";

interface Context {
  socket?: Socket;
  counter?: number;
  randValue?: number;
  setRandValue?: Function;
  userArr?: any[];
  setUserArr?: Function;
  playerNumber?: number;
  setPlayerNumber?: Function;
  isLoading?: boolean;
  setIsLoading?: Function;
  isShowModal?: string;
  setIsShowModal?: Function;
  currentDepositAmount?: number;
  setCurrentDepositAmount?: Function;
  numberDecimals?: number;
  alertState?: AlertState;
  setAlertState?: Function;
  newToken: any[];
  setNewToken: Function;
  newTx: any[];
  setNewTx: Function;
}

const context = createContext<Context>({
  newToken: [],
  setNewToken: undefined,
  newTx: [],
  setNewTx: undefined
});

export const useSocket = () => useContext(context);

const SocketProvider = (props: { children: any }) => {
  const { setCoinId, setNewMsg } = useContext(UserContext)
  const [socket, setSocket] = useState<Socket>();
  const [counter, setCounter] = useState<number>(1);
  const [randValue, setRandValue] = useState<number>(0);
  const [userArr, setUserArr] = useState<any[]>();
  const [playerNumber, setPlayerNumber] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowModal, setIsShowModal] = useState('');
  const [currentDepositAmount, setCurrentDepositAmount] = useState(0);
  const [numberDecimals, setNumberDecimals] = useState(3);
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    severity: undefined,
  })
  const [newToken, setNewToken] = useState<any[]>([]);
  const [newTx, setNewTx] = useState<any[]>([]);

  const router = useRouter();
  // const router = useRouter();
  // wallet Info
  const wallet = useWallet();
  const { connection } = useConnection();

  

  return (
    <context.Provider
      value={{
        socket,
        counter,
        randValue,
        setRandValue,
        userArr,
        setUserArr,
        playerNumber,
        setPlayerNumber,
        isLoading,
        setIsLoading,
        isShowModal,
        setIsShowModal,
        currentDepositAmount,
        setCurrentDepositAmount,
        numberDecimals,
        alertState,
        setAlertState,
        newToken,
        setNewToken,
        newTx,
        setNewTx
      }}
    >
      {props.children}
    </context.Provider>
  );
};

export interface AlertState {
  open: boolean
  message: string
  severity: 'success' | 'info' | 'warning' | 'error' | undefined
}

export default SocketProvider;