"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const t = useTranslations();
  const router = useRouter();

  return (
    <main className="max-w-6xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {t("All.Order Success")}
          </CardTitle>
        </CardHeader>
        <div className="flex justify-center mt-4 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4"
            />
          </svg>
        </div>
        <CardContent className="text-center space-y-4">
          <p>{t("All.Order Success Message")}</p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => router.push("/search")}
              className="rounded-full"
            >
              {t("All.See more Services")}
            </Button>
            <Button
              onClick={() => router.push("/account/orders")}
              className="rounded-full"
              variant="outline"
            >
              {t("All.View Orders")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
