import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";

import { auth } from "@/auth";

import { ProfileForm } from "./profile-form";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const PAGE_TITLE = "Update Profile";
export const metadata: Metadata = {
  title: PAGE_TITLE,
};

export default async function ProfilePage() {
  const session = await auth();

  return (
    <div className="mb-24">
      <SessionProvider session={session}>
        <div className="flex gap-2 ">
          <Link href="/account">Your Account</Link>
          <span>›</span>
          <Link href="/account/manage">Profile</Link>
          <span>›</span>
          <span>{PAGE_TITLE}</span>
        </div>
        <h1 className="h1-bold py-4">{PAGE_TITLE}</h1>
        <Card className="max-w-2xl">
          <CardContent className="p-4 flex justify-between flex-wrap">
            <p className="text-sm py-2">
              Veuillez mettre à jour vos informations et cliquez sur le bouton
              Enregistrer
            </p>
            <ProfileForm />
          </CardContent>
        </Card>
      </SessionProvider>
    </div>
  );
}
