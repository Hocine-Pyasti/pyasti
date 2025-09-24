import { Metadata } from "next";
import VerifyForm from "./verify-form";

export const metadata: Metadata = {
  title: "Verify Your Email",
};

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Verify Your Email
        </h1>
        <p className="mb-6 text-center">
          Enter the 4-digit code sent to your email address.
        </p>
        <VerifyForm userId={userId} />
      </div>
    </div>
  );
}
