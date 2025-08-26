import { Metadata } from "next";
import VerifyForm from "./verify-form";

export const metadata: Metadata = {
  title: "Verify Your Email",
};

export default async function VerifyPage(
  props:
    | { params: Promise<{ userId: string }> }
    | { params: { userId: string } }
) {
  // Support both direct and Promise params
  const params = "then" in props.params ? await props.params : props.params;
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Verify Your Email
        </h1>
        <p className="mb-6 text-center">
          Enter the 4-digit code sent to your email address.
        </p>
        <VerifyForm userId={params.userId} />
      </div>
    </div>
  );
}
