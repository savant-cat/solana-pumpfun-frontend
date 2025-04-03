"use client"
import React, { ChangeEvent, useRef, useState } from "react";

interface ImageUploadProps {
  header: string;
  setFilePreview: (filePreview: string | null) => void;
  type: string;
  setFileUrl: (fileUrl: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ header, setFilePreview, setFileUrl, type }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("No file selected");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      setFilePreview(URL.createObjectURL(file)); // Pass the file name or URL to the parent
      setFileUrl(URL.createObjectURL(file))
    } else {
      setSelectedFileName("No file selected");
      setFilePreview(null);
      setFileUrl(null)
    }
  };

  return (
    <div className="w-full flex flex-col justify-between gap-6">
      <div className="w-full justify-between flex flex-col items-start gap-2 ">
        <label className="text-lg font-semibold text-[#fdd52f] flex flex-row gap-1">{header} <p className="text-red-600">*</p></label>
        <input
          type="file"
          accept={type}
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="w-full h-full flex flex-row justify-between gap-4 items-center">
          <div className="w-full py-2 px-3 bg-transparent rounded-lg min-h-10 text-white/70 border-[#fdd52f] border-[1px]">
            {selectedFileName}
          </div>
          <button
            className="py-2 px-4 text-[#fdd52f] rounded-lg border-[#fdd52f] border-[1px] font-bold bg-[#fdd52f]/5 hover:bg-[#fdd52f]/30"
            onClick={() => fileInputRef.current?.click()}
          >
            Browse...
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;