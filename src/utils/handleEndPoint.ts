import { errorAlertCenter } from "@/components/others/ToastGroup";
import axios, { AxiosRequestConfig, Method } from "axios";

// Define the type for user data, this can be more specific based on your API requirements
interface UserData {
  [key: string]: any; // Replace `any` with specific key-value types if known
}

// Base URL of your backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Define the `handleEndpoint` function
const handleEndpoint = async (
  userData: UserData,
  endpoint: string,
  method: Method,
  token: boolean
): Promise<any> => {
  const bippleToken = typeof window !== "undefined" ? localStorage?.getItem("auth_token") : null;

  try {
    // Configure the request
    const config: AxiosRequestConfig = {
      method: method.toUpperCase() as Method,
      url: `${API_BASE_URL}/${endpoint}`,
      data: method.toUpperCase() !== "GET" ? userData : null,
      headers: {
        authorization: token && bippleToken ? `Bearer ${bippleToken}` : undefined,
      },
    };

    // Send the request
    const response = await axios(config);
    console.log("handleEndpoint response:", response.data, endpoint);
    return response.data;
  } catch (error: any) {
    // Handle different types of errors
    if (error.response) {
      // The server responded with a status code
      console.log("Error response:", error);
      errorAlertCenter(error.response.data?.error || "Request failed");
    } else if (error.request) {
      // The request was made but no response was received
      errorAlertCenter("No response received from server");
    } else {
      // Something happened during request setup
      errorAlertCenter("Error setting up the request");
    }
    throw error; // Optionally rethrow the error for higher-level handling
  }
};

export { handleEndpoint };
