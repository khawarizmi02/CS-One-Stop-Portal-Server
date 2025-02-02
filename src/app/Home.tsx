import React from "react";
import Image from "next/image";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

import { Layout } from "@/styles/page-layout";

import HomeBg from "../../public/Home-BG.png";
import Logo from "../../public/logo.svg";

const Home = () => {
  return (
    <div
      className={`${Layout.center} min-h-screen min-w-full bg-slate-100`}
      style={{
        backgroundImage: `url(${HomeBg.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className={`${Layout.mwidth} flex w-full flex-col items-center`}>
        <div className="flex flex-row items-center justify-center">
          <Image src={Logo} alt="logo" />
          <div>
            <h1 className="h1 text-secondary">CS ONE STOP PORTAL</h1>
            <h3 className="uppercase text-secondary">
              Portal for computer science community
            </h3>
          </div>
        </div>
        <SignInButton>
          <Button className="mt-10 px-5 py-5">Login Now</Button>
        </SignInButton>
      </div>
    </div>
  );
};

export default Home;
