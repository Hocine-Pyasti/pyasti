import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import SeparatorWithOr from "@/components/shared/separator-or";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import CredentialsSignInForm from "./credentials-signin-form";
import { GoogleSignInForm } from "./google-signin-form";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function SignInPage(props: {
  searchParams: Promise<{
    callbackUrl: string;
  }>;
}) {
  const t = await getTranslations("Auth");
  const searchParams = await props.searchParams;

  const { callbackUrl = "/" } = searchParams;

  const session = await auth();
  if (session) {
    return redirect(callbackUrl);
  }

  return (
    <div className="w-full">
      <Card className="bg-gray-200/50 backdrop-blur-lg ">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {t("Sign In")}{" "}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <CredentialsSignInForm />
            <SeparatorWithOr />
            <div className="mt-4">
              <GoogleSignInForm />
            </div>
          </div>
        </CardContent>
      </Card>
      <SeparatorWithOr>{t("New to")}</SeparatorWithOr>

      <Link href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
        <Button className="w-full" variant="outline">
          {t("Create Account")}
        </Button>
      </Link>
    </div>
  );
}
