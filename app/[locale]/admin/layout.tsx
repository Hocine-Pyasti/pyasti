import Image from "next/image";
import Link from "next/link";
import React from "react";
import Menu from "@/components/shared/header/menu";
import { AdminNav } from "./admin-nav";
import { getSetting } from "@/lib/actions/setting.actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { site } = await getSetting();
  return (
    <>
      <div
        className="flex flex-col bg-no-repeat bg-center bg-cover bg-fixed min-h-screen"
        style={{
          backgroundImage: `url('/images/admin-bg.jpg')`,
        }}
      >
        <div className="bg-black/50 backdrop-blur-md text-white border-b-2 border-red-600">
          <div className="flex h-16 items-center px-2">
            <Link href="/">
              <Image
                src="/logo.png"
                width={350}
                height={300}
                alt="Pyasti logo"
                className="h-10 w-auto"
              />
            </Link>
            <AdminNav className="mx-6 hidden md:flex" />
            <div className="ml-auto flex items-center space-x-4">
              <Menu forAdmin />
            </div>
          </div>
          <div>
            <AdminNav className="flex md:hidden px-4 pb-2" />
          </div>
        </div>
        <div className="flex-1 p-4">{children}</div>
      </div>
    </>
  );
}
