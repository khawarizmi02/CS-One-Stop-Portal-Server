import React from "react";
import { Hash } from "lucide-react";

const page = () => {
  return (
    <div className="flex h-screen w-full flex-col py-6">
      {/* Server header */}
      <div className="flex h-12 items-center border-b border-[#e3e5e8] bg-white px-4 shadow-sm">
        <Hash className="mr-2 h-5 w-5 text-gray-500" />
        <h3 className="font-semibold">group-members</h3>
      </div>
    </div>
  );
};

export default page;
