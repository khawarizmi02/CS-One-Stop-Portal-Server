import React from "react";
import { Hash } from "lucide-react";

const MediaPage = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="flex h-12 items-center border-b border-[#e3e5e8] bg-white px-4 shadow-xs">
        <Hash className="mr-2 h-5 w-5 text-gray-500" />
        <h3 className="font-semibold">group-media</h3>
      </div>
    </div>
  );
};

export default MediaPage;
