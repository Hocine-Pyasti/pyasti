"use client";
import { redirect, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { IUserSignIn } from "@/types";
import {
  signInWithCredentials,
  getUserByEmail,
} from "@/lib/actions/user.actions";

import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserSignInSchema } from "@/lib/validator";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useTranslations } from "next-intl";

const signInDefaultValues = {
  email: "",
  password: "",
};

export default function CredentialsSignInForm() {
  const t = useTranslations("Auth");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const form = useForm<IUserSignIn>({
    resolver: zodResolver(UserSignInSchema),
    defaultValues: signInDefaultValues,
  });

  const { control, handleSubmit } = form;

  const onSubmit = async (data: IUserSignIn) => {
    try {
      // First check if user exists and is verified
      const userResult = await getUserByEmail(data.email);

      if (
        userResult.success &&
        userResult.user &&
        !userResult.user.emailVerified
      ) {
        // User exists but is not verified, redirect to verification page
        toast({
          title: "Email Not Verified",
          description: "Please verify your email before signing in.",
          variant: "destructive",
        });
        // Redirect to verification page
        window.location.href = `/verify/${userResult.user._id}`;
        return;
      }

      const result = await signInWithCredentials({
        email: data.email,
        password: data.password,
      });

      // Check if sign in was successful
      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          toast({
            title: "Error",
            description: "Invalid email or password",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Invalid email or password",
            variant: "destructive",
          });
        }
        return;
      }

      redirect(callbackUrl);
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div className="space-y-6">
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-center">
            <Button type="submit">{t("Sign In")} </Button>
          </div>
          <div className="text-sm">
            {t("Privacy text")}
            <Link href="/page/privacy-policy">{t("Privacy Policy")}</Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
