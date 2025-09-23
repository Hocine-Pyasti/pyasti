import { HelpCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useTranslations } from "next-intl";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations();
  return (
    <div className="p-4">
      <header className="bg-card mb-4 border-b">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="logo"
              width={500}
              height={500}
              className="h-10 w-auto"
            />
          </Link>
          <div>
            <h1 className="text-3xl">{t("Cart.Checkout")} </h1>
          </div>
          <div>
            <Link href="/page/help">
              <HelpCircle className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
