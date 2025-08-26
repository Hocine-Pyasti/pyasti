import Image from "next/image";
import Link from "next/link";
import React from "react";
import Menu from "@/components/shared/header/menu";
import { SellerNav } from "./seller-nav";
import { getSetting } from "@/lib/actions/setting.actions";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { site } = await getSetting();
  return (
    <>
      <div
        className="flex flex-col bg-no-repeat bg-center bg-cover min-h-screen"
        style={{
          backgroundImage: `url('/images/seller-bg.jpg')`,
        }}
      >
        <div className="bg-black/50 backdrop-blur-md text-white border-b-2 border-blue-600">
          <div className="flex h-16 items-center px-2">
            <Link href="/">
              <Image
                src="/logo.png"
                width={150}
                height={40}
                alt={`${site.name} logo`}
                className="h-10 w-auto"
              />
            </Link>
            <SellerNav className="mx-6 hidden md:flex" />
            <div className="ml-auto flex items-center space-x-4">
              <Menu forAdmin />
            </div>
          </div>
          <div>
            <SellerNav className="flex md:hidden px-4 pb-2" />
          </div>
        </div>
        <div className="flex-1 p-4">{children}</div>
      </div>
    </>
  );
}
