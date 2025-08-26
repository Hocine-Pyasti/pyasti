import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VerifyForm from "./verify-form";

export const metadata: Metadata = {
  title: "Verify Email",
};

export default async function VerifyPage({
  params,
}: {
  params: { userId: string };
}) {
  const session = await auth();
  if (session) {
    return redirect("/");
  }

  return (
    <div className="w-full">
      <Card className="bg-gray-200/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Verify Your Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Please enter the 4-digit verification code sent to your email.
            </p>
          </div>
          <VerifyForm userId={params.userId} />
        </CardContent>
      </Card>
    </div>
  );
}
