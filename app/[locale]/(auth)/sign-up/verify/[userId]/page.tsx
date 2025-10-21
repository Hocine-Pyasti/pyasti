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
    <div className="w-full flex flex-col items-center justify-center h-[50vh]">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Vérifiez votre e-mail
        </h1>
        <p className="mb-6 text-center">
          Saisissez le code à 4 chiffres envoyé à votre adresse e-mail.
        </p>
        <VerifyForm userId={params.userId} />
      </div>
    </div>
  );
}
