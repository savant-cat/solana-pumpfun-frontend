import UserContext from '@/context/UserContext';
import { coinInfo, replyInfo } from '@/utils/types';
import { postReply } from '@/utils/util';
import { uploadImage } from '@/utils/fileUpload';
import { ImUpload } from "react-icons/im";
import React, { ChangeEvent, useContext, useRef, useState } from 'react';
import { errorAlert, successAlert, warningAlert } from '../others/ToastGroup';
import Spinner from '../loadings/Spinner';
import Image from 'next/image';

interface ModalProps {
  data: coinInfo;
}

const ReplyModal: React.FC<ModalProps> = ({ data }) => {
  const { postReplyModal, setPostReplyModal, user, isLoading, setIsLoading } = useContext(UserContext);
  const [fileName, setFileName] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [msg, setMsg] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const replyPost = async () => {
    if (user.wallet === undefined || user.wallet === null || user.wallet === "") {
      warningAlert("Connect your wallet!")
      return
    }

    try {
      handleModalToggle();
      setIsLoading(true)
      let reply: replyInfo;
      if (imageUrl) {
        const url = await uploadImage(imageUrl);
        console.log("url: ==> ", url)
        console.log("user._id: ==> ", user._id)
        if (url && user._id) {
          reply = {
            coinId: data._id,
            sender: user._id,
            msg: msg,
            img: url
          }
        }
      } else {
        if (user._id) {
          reply = {
            coinId: data._id,
            sender: user._id,
            msg: msg,
          }
        }
      }
      console.log("reply text ==> ", reply)
      await postReply(reply);
      setIsLoading(false)
    } catch (err: any) {
      errorAlert(err)
      setIsLoading(false)
    }
  }

  const handleModalToggle = () => {
    setPostReplyModal(!postReplyModal);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        successAlert('Please select a valid image file.');
        return;
      }
      const url = URL.createObjectURL(file);
      let _fileName = file.name.length > 18
        ? `${file.name.slice(0, 6)}...${file.name.slice(-6)}`
        : file.name;

      setFileName(_fileName || '');
      setImageUrl(url); // URL.createObjectURL always returns a string
    }
  };

  return (
    <>
      {isLoading && <Spinner />}
      <div className='fixed w-full inset-0 flex items-center justify-center z-40 backdrop-blur-md'>
        <div className="flex w-full max-w-[300px] sm:max-w-xl flex-col p-6 rounded-md gap-3 bg-[#000] border-[1px] border-[#fdd52f] text-[#fdd52f] relative shadow-[0px_8px_8px_0px] shadow-[#fdd52f]/50">
          <h2 className="text-center text-2xl font-bold">Post Reply</h2>
          <div className=" w-full px-2 flex flex-col">
            <label
              htmlFor="COMMIT  py-[20px]"
              className="block mb-2 text-sm font-medium text-[#fdd52f]"
            >
              Commit :
            </label>
            <textarea
              id="msg"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="rounded-lg w-full p-2.5 outline-none bg-transparent border-[1px] border-[#fdd52f] min-h-[140px]"
              placeholder="Add commit ..."
              required
            />
          </div>

          <div className="w-full flex flex-col md:flex-row justify-between gap-3 md:pr-6">
            <div>
              <label
                htmlFor="fileUpload"
                className="block text-lg font-medium mb-2 text-[#fdd52f]"
              >
                Upload Image:
              </label>
              <label
                htmlFor="fileUpload"
                className="w-full p-2 rounded-lg outline-none border-[1px] border-[#fdd52f] text-center text-[#fdd52f] cursor-pointer hover:bg-[#fdd52f]/30  transition mx-auto flex"
              >
                {fileName || 'Choose an Image'}
              </label>
              <input
                id="fileUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </div>

            {imageUrl ? (
              <div className="w-48 h-48 border-[1px] border-[#fdd52f] rounded-lg overflow-hidden justify-center p-3">
                <Image
                  src={imageUrl as string} // Ensure it's a string
                  alt="Selected Preview"
                  width={192}
                  height={192}
                  className="flex object-cover w-full h-full mx-auto rounded-lg"
                />
              </div>
            ) : (
              <div className="w-48 h-48 border-[1px] border-[#fdd52f] rounded-lg overflow-hidden p-3 items-center justify-center flex flex-col">
                <ImUpload className='text-9xl flex flex-col mx-auto' />
              </div>
            )}
          </div>
          <div className="flex justify-around p-3">
            <button onClick={replyPost} className="mt-2 px-4 py-2 border-[1px] border-[#fdd52f] hover:bg-[#fdd52f]/30 text-[#fdd52f] rounded-md">POST</button>
            <button onClick={handleModalToggle} className="mt-2 px-4 py-2 border-[1px] border-[#fdd52f] hover:bg-[#fdd52f]/30 text-[#fdd52f] rounded-md">Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReplyModal;
