import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";

import { auth } from "@/auth";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getUserById } from "@/lib/actions/user.actions";

const PAGE_TITLE = "Profile Management";
export const metadata: Metadata = {
  title: PAGE_TITLE,
};
export default async function ProfilePage() {
  const session = await auth();
  const userData = await getUserById(session?.user.id || "");

  return (
    <div className="mb-24">
      <SessionProvider session={session}>
        <div className="flex gap-2 ">
          <Link href="/account">Profile</Link>
          <span>›</span>
          <span>{PAGE_TITLE}</span>
        </div>
        <h1 className="h1-bold py-4">{PAGE_TITLE}</h1>
        <Card className="max-w-2xl ">
          <CardContent className="p-4 flex justify-between flex-wrap">
            <div className="flex items-center gap-4">
              <div>
                <Image
                  src={userData.image || "/avatars/av01.png"}
                  alt="Profile Image"
                  width={50}
                  height={50}
                  className="rounded-full"
                />
              </div>
              <div className="h-2" />
              <div className="flex items-center gap-2"></div>
              <div>
                <h3 className="font-bold">{session?.user.name}</h3>
                <p>{session?.user.email}</p>
              </div>
            </div>
            <div>
              <Link href="/account/manage/profile">
                <Button className="rounded-full w-32" variant="outline">
                  Edit
                </Button>
              </Link>
            </div>
          </CardContent>
          <Separator />
          <CardContent className="p-4 flex justify-between flex-wrap">
            <div>
              <h3 className="font-bold">Personal Information</h3>
              <p>
                {" "}
                <span className="font-bold">Phone:</span> {userData.phoneNumber}
              </p>
              <p>
                {" "}
                <span className="font-bold">Address:</span>
                {userData.address?.street} / {userData.address?.city} /{" "}
                {userData.address?.province} / {userData.address?.postalCode} /{" "}
                {userData.address?.country}{" "}
              </p>
              <p>
                <span className="font-bold">Sex:</span> {userData.gender}{" "}
              </p>
              <p>
                <span className="font-bold">Date of Birth:</span>{" "}
                {userData.dateOfBirth
                  ? new Date(userData.dateOfBirth).toLocaleDateString("en-GB")
                  : ""}{" "}
              </p>
              <p>
                <span className="font-bold">Profile Type:</span>{" "}
                {userData.profileType}{" "}
              </p>
              <p>
                <span className="font-bold">Wallet:</span> {userData.wallet} DZD
              </p>
            </div>
          </CardContent>

          {userData.role === "Seller" && userData.shopDetails && (
            <>
              <Separator />
              <CardContent className="p-4 flex flex-col gap-4">
                <h3 className="font-bold">Business Information</h3>
                <div className="flex items-center gap-4">
                  <Image
                    src={
                      userData.shopDetails.bannerImage || "/avatars/shop1.png"
                    }
                    alt="Shop Banner"
                    width={100}
                    height={50}
                    className="rounded"
                  />
                  <div>
                    <p>
                      <span className="font-bold">Business Name:</span>{" "}
                      {userData.shopDetails.shopName}
                    </p>
                    <p>
                      <span className="font-bold">Business Phone:</span>{" "}
                      {userData.shopDetails.shopPhone}
                    </p>
                    <p>
                      <span className="font-bold">Description:</span>{" "}
                      {userData.shopDetails.shopDescription}
                    </p>
                    <p>
                      <span className="font-bold">Address:</span>{" "}
                      {userData.shopDetails.shopAddress}
                    </p>
                  </div>
                </div>
              </CardContent>
            </>
          )}
          <Separator />
          <CardContent className="p-4 flex justify-between flex-wrap">
            <div>
              <h3 className="font-bold">Password</h3>
              <p>************</p>
            </div>
            <div>
              <Link href="#">
                <Button
                  disabled
                  className="rounded-full w-32"
                  variant="outline"
                >
                  Edit
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </SessionProvider>
    </div>
  );
}
