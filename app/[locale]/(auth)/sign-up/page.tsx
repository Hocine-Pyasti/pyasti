import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import SignUpForm from "./signup-form";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default async function SignUpPage(props: {
  searchParams: Promise<{
    callbackUrl: string;
  }>;
}) {
  const t = await getTranslations("Auth");
  const searchParams = await props.searchParams;

  const { callbackUrl } = searchParams;

  const session = await auth();
  if (session) {
    return redirect(callbackUrl || "/");
  }

  return (
    <div className="w-full">
      <Card className="bg-gray-200/50 backdrop-blur-lg ">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {t("Create Account")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  );
}
