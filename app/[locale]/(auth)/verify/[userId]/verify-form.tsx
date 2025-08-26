"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  verifyUserCode,
  resendVerificationCode,
} from "@/lib/actions/user.actions";

export default function VerifyForm({ userId }: { userId: string }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const res = await verifyUserCode(userId, code);
    setLoading(false);
    if (res.success) {
      setSuccess("Your account has been verified! You can now sign in.");
      setTimeout(() => router.push("/sign-in"), 2000);
    } else {
      setError(res.error || "Invalid code");
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError("");
    const res = await resendVerificationCode(userId);
    setResendLoading(false);

    if (res.success) {
      setSuccess("New verification code sent to your email!");
      setResendCooldown(300); // 5 minutes cooldown
    } else {
      setError(res.error || "Failed to send verification code");
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          maxLength={4}
          pattern="[0-9]{4}"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="w-full p-2 border rounded text-center text-lg tracking-widest"
          placeholder="_ _ _ _"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResendCode}
          disabled={resendLoading || resendCooldown > 0}
          className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {resendLoading
            ? "Sending..."
            : resendCooldown > 0
              ? `Resend in ${Math.floor(resendCooldown / 60)}:${(
                  resendCooldown % 60
                )
                  .toString()
                  .padStart(2, "0")}`
              : "Resend Code"}
        </button>
      </div>

      {error && <div className="text-red-600 text-center">{error}</div>}
      {success && <div className="text-green-600 text-center">{success}</div>}
    </div>
  );
}
