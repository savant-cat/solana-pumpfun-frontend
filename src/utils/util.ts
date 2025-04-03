import axios, { AxiosRequestConfig } from 'axios';
import { ChartTable, coinInfo, holderInfo, msgInfo, replyInfo, userInfo } from './types';

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const headers: Record<string, string> = {
  'ngrok-skip-browser-warning': 'true'
};

const config: AxiosRequestConfig = {
  headers
};

export const test = async () => {
  const res = await fetch(`${BACKEND_URL}`);
  const data = await res.json();
  console.log(data);
};

export const getUser = async ({ id }: { id: string }): Promise<any> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/user/${id}`, config);
    console.log('response:', response.data);
    return response.data;
  } catch (err) {
    return { error: 'error setting up the request' };
  }
};

export const updateUser = async (id: string, data: userInfo): Promise<any> => {
  try {
    console.log("update user ==>", data)
    console.log(`${BACKEND_URL}/user/update/${id}`);
    const response = await axios.post(`${BACKEND_URL}/user/update/${id}`, data, config);
    console.log("update user response ==>", response)

    return response.data;
  } catch (err) {
    return { error: 'error setting up the request' };
  }
};

export const walletConnect = async ({ data }: { data: userInfo }): Promise<any> => {
  try {
    console.log("walletConnect data   =>", data)
    const response = await axios.post(`${BACKEND_URL}/user/`, data);
    console.log("walletConnect response   =>", response)

    return response.data;
  } catch (err) {
    return { error: 'error setting up the request' };
  }
};

export const confirmWallet = async ({ data }: { data: userInfo }): Promise<any> => {
  try {
    const response = await axios.post(`${BACKEND_URL}/user/confirm`, data, config);
    return response.data;
  } catch (err) {
    return { error: 'error setting up the request' };
  }
};

export const getCoinsInfo = async (): Promise<coinInfo[]> => {
  try {
    const res = await axios.get(`${BACKEND_URL}/coin`, config);
    return res.data;
  } catch (error) {
    console.error('Error fetching coin info:', error);
  }
};

export const getCoinsInfoBy = async (id: string): Promise<coinInfo[]> => {
  const res = await axios.get<coinInfo[]>(`${BACKEND_URL}/coin/user/${id}`, config);
  return res.data;
};

export const getCoinInfo = async (data: string): Promise<any> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/coin/${data}`, config);
    return response.data;
  } catch (err) {
    return { error: 'error setting up the request' };
  }
};

export const getUserInfo = async (data: string): Promise<any> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/user/${data}`, config);
    return response.data;
  } catch (err) {
    return { error: 'error setting up the request' };
  }
};

export const getMessageByCoin = async (data: string): Promise<msgInfo[]> => {
  try {
    console.log('data:', data);
    const response = await axios.get(`${BACKEND_URL}/feedback/coin/${data}`, config);
    console.log('messages:', response.data);
    return response.data;
  } catch (err) {
    return [];
  }
};

export const getCoinTrade = async (data: string): Promise<any> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/cointrade/${data}`, config);
    return response.data;
  } catch (err) {
    return { error: 'error setting up the request' };
  }
};

export const postReply = async (data: replyInfo) => {
  console.log("data ==> ", data)
  try {
    const response = await axios.post(`${BACKEND_URL}/feedback/`, data, config);
    return response.data;
  } catch (err) {
    return { error: 'error setting up the request' };
  }
};

// ================== Get Holders ===========================
export const findHolders = async (mint: string) => {
  // Pagination logic
  let page = 1;
  // allOwners will store all the addresses that hold the token
  let allOwners: holderInfo[] = [];

  while (true) {
    const response = await fetch(process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://devnet.helius-rpc.com/?api-key=44b7171f-7de7-4e68-9d08-eff1ef7529bd', {
      //   const response = await fetch("https://white-aged-glitter.solana-mainnet.quiknode.pro/743d4e1e3949c3127beb7f7815cf2ca9743b43a6/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'getTokenAccounts',
        id: 'helius-test',
        params: {
          page: page,
          limit: 1000,
          displayOptions: {},
          //mint address for the token we are interested in
          mint: mint
        }
      })
    });

    console.log("response   =>>>", response)

    const data = await response.json();

    console.log("data   =>>>", data)

    // Pagination logic.
    if (!data.result || data.result.token_accounts.length === 0) {
      break;
    }
    console.log("holders", data)
    // Adding unique owners to a list of token owners.
    data.result.token_accounts.forEach((account) => {
      allOwners.push({ slice: account.owner.slice(0, 3) + `...` + account.owner.slice(-4), owner: account.owner, amount: account.amount });
    });
    page++;
  }

  return allOwners;
};

export const getSolPriceInUSD = async () => {
  try {
    // Fetch the price data from CoinGecko
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    const solPriceInUSD = response.data.solana.usd;
    return solPriceInUSD;
  } catch (error) {
    console.error('Error fetching SOL price:', error);
    throw error;
  }
};

// export const getBondingCurve = async (mint: string): Promise<any> => {
//   try {
//     console.log("------ get bondingcurve -------")
//     console.log(mint)

//     const response = await axios.post(`${BACKEND_URL}/coin/bongdingCurve`, { mint }, config);

//     return response.data;
//   } catch (err) {
//     console.error("Error in getCoinInfo:", err);
//     return { error: "Error setting up the request" };
//   }
// }

export const uploadImage = async (url: string) => {
  const res = await fetch(url);
  console.log(res.blob);
  const blob = await res.blob();

  const imageFile = new File([blob], "image.png", { type: "image/png" });
  console.log(imageFile);
  const resData = await pinFileToIPFS(imageFile);
  console.log("imageFile ==>", imageFile)
  console.log(resData, "RESDATA>>>>");
  if (resData) {
    return `https://gateway.pinata.cloud/ipfs/${resData.IpfsHash}`;
  } else {
    return false;
  }
};

const JWT = process.env.NEXT_PUBLIC_PINATA_PRIVATE_KEY;

export const pinFileToIPFS = async (blob: File) => {
  try {
    const data = new FormData();
    data.append("file", blob);
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
      body: data,
    });
    const resData = await res.json();
    return resData;
  } catch (error) {
    console.log(error);
  }
};