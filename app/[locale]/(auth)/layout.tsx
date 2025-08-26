import { getSetting } from "@/lib/actions/setting.actions";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { site } = await getSetting();
  return (
    <div
      className="flex flex-col items-center min-h-screen highlight-link bg-cover bg-no-repeat bg-center bg-fixed"
      style={{
        backgroundImage: `url(/images/bg1.jpg)`,
      }}
    >
      <header className="mt-8">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="logo"
            width={1250}
            height={500}
            priority
            style={{
              maxWidth: "100%",
              width: "350px",
              height: "auto",
            }}
          />
        </Link>
      </header>
      <main className="mx-auto max-w-lg min-w-80 p-4">{children}</main>
      <footer className="flex-1 mt-8 bg-gray-800 w-full flex flex-col gap-4 items-center p-8 text-sm">
        <div className="flex justify-center space-x-4">
          <Link href="/page/conditions-of-use">Conditions of Use</Link>
          <Link href="/page/privacy-policy">Privacy Notice</Link>
          <Link href="/page/help">Help</Link>
        </div>
        <div>
          <p className="text-gray-400">{site.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
