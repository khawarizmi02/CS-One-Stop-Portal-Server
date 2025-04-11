"use client";

import { usePathname } from "next/navigation";

const usePageName = () => {
  const pathname = usePathname();
  const pageName = pathname.split("/")[1] || "home";

  return {
    pageName,
  };
};

export default usePageName;
