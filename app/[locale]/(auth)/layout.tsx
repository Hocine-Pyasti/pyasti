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
      <footer className="flex-1 mt-8 bg-blue-900/70 backdrop-blur-md w-full flex flex-col gap-4 items-center p-8 text-sm">
        <div className="flex justify-center space-x-4 text-gray-200">
          <Link style={{ color: "#f9f9f9" }} href="/page/conditions-of-use">
            Conditions of Use
          </Link>
          <Link style={{ color: "#f9f9f9" }} href="/page/privacy-policy">
            Privacy Notice
          </Link>
          <Link style={{ color: "#f9f9f9" }} href="/page/help">
            Help
          </Link>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-2">
          <p className="text-gray-200 font-bold">{site.copyright} </p>{" "}
          <a
            className="text-green-400 font-bold no-underline"
            href="https://gcosmosweb.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#00fb04" }}
          >
            By GCW
          </a>
        </div>
      </footer>
    </div>
  );
}
