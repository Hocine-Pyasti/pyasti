"use client";

import Image from "next/image";

export default function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-100">
      <div className="p-8 rounded-lg shadow-lg bg-white w-full md:w-1/3  text-center">
        <Image
          src="/logo-load.png"
          width={800}
          height={500}
          alt="Pyasti logo"
          className="mx-auto mb-6"
          style={{ width: "200px", height: "auto" }}
        />
        <div className="relative flex justify-center">
          <Image
            src="/images/wheel.png"
            width={500}
            height={500}
            alt="Rotating car wheel"
            className="animate-spin w-28 h-28"
            style={{ animation: "spin 1.5s linear infinite" }}
          />
        </div>
      </div>
    </div>
  );
}
