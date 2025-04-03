import UserContext from '@/context/UserContext';
import { userInfo } from '@/utils/types';
import { updateUser, walletConnect } from '@/utils/util';
import { uploadImage } from '@/utils/fileUpload';
import React, { ChangeEvent, useContext, useEffect, useRef, useState } from 'react';
import { errorAlert, successAlert } from '../others/ToastGroup';
import UserImg from '@/../public/assets/images/user-avatar.png';
import Image from 'next/image';
import Spinner from '../loadings/Spinner';

interface ModalProps {
  data: userInfo;
}

const Modal: React.FC<ModalProps> = ({ data }) => {
  const { setProfileEditModal, setUser, user, isLoading, setIsLoading } = useContext(UserContext);
  const [index, setIndex] = useState<userInfo>(data);
  const [imagePreview, setImagePreview] = useState<string | null>(data.avatar || null);
  const [fileName, setFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIndex({ ...index, [e.target.id]: e.target.value });
  };

  useEffect(() => {
    console.log("uploadedUrl1 ==>", data)
  }, [data])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      const url = URL.createObjectURL(file);
      let _fileName = file.name.length > 18
        ? `${file.name.slice(0, 6)}...${file.name.slice(-6)}`
        : file.name;

      setFileName(_fileName || ''); // Ensure it's always a string
      console.log("url ==>", url)
      setImagePreview(url); // URL.createObjectURL always returns a string
    }
  };

  const sendUpdate = async () => {
    setProfileEditModal(false)
    setIsLoading(true)
    try {
      let uploadedUrl: string = index.avatar || ''; // Ensure it starts as a string
      console.log("imagePreview ==>", imagePreview)

      if (imagePreview && imagePreview !== index.avatar) {
        console.log("imagePreview1 ==>", imagePreview)
        const uploadResult = await uploadImage(imagePreview);
        console.log("imagePreview2 ==>", uploadResult)
        uploadedUrl = uploadResult || ''; // If uploadImage returns false, fallback to an empty string
      }

      console.log("uploadedUrl ==>", uploadedUrl)
      const updatedUser = {
        ...index,
        avatar: uploadedUrl,
      };

      console.log("updatedUser ==>", updatedUser)


      const connection = await walletConnect({ data: updatedUser });

      const result = await updateUser(updatedUser._id, updatedUser);

      if (result.error) {
        errorAlert('Failed to save the data.');
      } else {
        successAlert('Successfully updated.');
        setUser(updatedUser);
        setProfileEditModal(false);
      }
      setIsLoading(false)
    } catch (error) {
      errorAlert('An error occurred while updating your profile.');
      setIsLoading(false)
    }
  };

  return (
    <>
      {isLoading && <Spinner />}
      <div className="fixed w-full inset-0 flex items-center justify-center z-40 backdrop-blur-md">
        <div className="flex w-full max-w-[300px] sm:max-w-xl flex-col p-6 rounded-md gap-3 bg-black border-[1px] border-[#fdd52f] text-[#fdd52f] relative shadow-[0px_8px_8px_0px] shadow-[#fdd52f]">
          <button
            onClick={() => setProfileEditModal(false)}
            className="absolute top-2 right-2 text-[#fdd52f]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-center text-2xl font-bold">Edit Profile</h2>
          <div className="w-full flex flex-col">
            <label className="block text-lg font-medium text-[#fdd52f]" htmlFor="name">
              Username:
            </label>
            <input
              className="w-full p-2 rounded-lg outline-none bg-transparent border-[1px] border-[#fdd52f]"
              type="text"
              id="name"
              value={index.name || ''}
              onChange={handleChange}
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
                className="w-full max-w-[180px] p-2 rounded-lg outline-none border-[1px] border-[#fdd52f] text-center text-[#black] cursor-pointer hover:bg-[#fdd52f]/30 transition mx-auto flex"
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

            {(imagePreview !== "https://scarlet-extra-cat-880.mypinata.cloud/" && imagePreview !== "" && imagePreview !== undefined && imagePreview !== null && imagePreview) ? (
              <div className="w-48 h-48 rounded-lg overflow-hidden justify-center mx-auto border-[#fdd52f] border-[1px]">
                <Image
                  src={imagePreview as string} // Ensure it's a string
                  alt="Selected Preview"
                  width={192}
                  height={192}
                  className="flex object-cover w-full h-full mx-auto"
                />
              </div>
            ) : (
              <div className="w-48 h-48 border-[1px] border-[#fdd52f] rounded-lg overflow-hidden p-3">
                <Image
                  src={UserImg}
                  alt="Default Avatar"
                  width={192}
                  height={192}
                  className="flex object-cover w-full h-full rounded-full mx-auto"
                />
              </div>
            )}
          </div>

          <div className="flex justify-around">
            <button
              className="mt-2 px-8 py-2 border-[1px] border-[#fdd52f] text-[#fdd52f] bg-[#fdd52f]/5 hover:bg-[#fdd52f]/30 rounded-full"
              onClick={sendUpdate}
            >
              Save
            </button>
            <button
              className="mt-2 px-8 py-2 border-[1px] border-[#fdd52f] text-[#fdd52f] bg-[#fdd52f]/5 hover:bg-[#fdd52f]/30 rounded-full"
              onClick={() => setProfileEditModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
