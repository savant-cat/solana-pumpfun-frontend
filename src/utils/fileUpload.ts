import { coinInfo, metadataInfo } from "./types";


const pinataApiKey: string | undefined = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const pinataSecretApiKey: string | undefined = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;

interface PinataResponse {
    IpfsHash: string;
    // Add other properties if needed based on API response
}

interface PinFileToIPFS {
    file: Blob;
}

export const pinFileToIPFS = async (blob: Blob): Promise<PinataResponse | void> => {
    console.log("pinataKey---->", pinataApiKey, pinataSecretApiKey)
    try {
        const data = new FormData();
        data.append("file", blob);

        const res = await fetch(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            {
                method: "POST",
                headers: {
                    'pinata_api_key': pinataApiKey || '',
                    'pinata_secret_api_key': pinataSecretApiKey || ''
                },
                body: data,
            }
        );

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const resData: PinataResponse = await res.json();
        return resData;
    } catch (error) {
        console.error(error);
    }
};

export const uploadImage = async (url: string): Promise<string | false> => {
    console.log("file---->", url);
    const res = await fetch(url);

    if (!res.ok) {
        console.error(`Failed to fetch image from URL, status: ${res.status}`);
        return false;
    }

    const blob: Blob = await res.blob();
    const imageFile = new File([blob], "image.png", { type: "image/png" });

    console.log(imageFile);
    const resData = await pinFileToIPFS(imageFile);

    console.log(resData, "RESDATA>>>>");

    if (resData) {
        return `https://ipfs.io/ipfs/${resData.IpfsHash}`;
    } else {
        return false;
    }
};

export const uploadMetadata = async (metadata: metadataInfo): Promise<any> => {
    console.log("metadata--->", metadata)
    try {
        const response = await fetch(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            {
                method: "POST",
                headers: {
                    // Replace YOUR_PINATA_JWT with your actual JWT token
                    'pinata_api_key': pinataApiKey || '',
                    'pinata_secret_api_key': pinataSecretApiKey || '',
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pinataContent: metadata,
                }),
            }
        );
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('upload json to pinata => ', data);
        return `https://ipfs.io/ipfs/${data.IpfsHash}`;
    } catch (error) {
        console.error("Error uploading JSON to Pinata:", error);
        throw error;
    }
}