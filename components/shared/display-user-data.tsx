"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getPublicUserDataById } from "@/lib/actions/user.actions";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface UserData {
  bannerImage?: string;
  shopName?: string;
  shopPhone?: string;
  shopDescription?: string;
  shopAddress?: string;
  shopType?: string;
  role?: string;
}

interface DisplayUserDataProps {
  userId: string;
  showName?: boolean;
  showBannerImage?: boolean;
  showPhoneNumber?: boolean;
  showDescription?: boolean;
  showAddress?: boolean;
  showShopType?: boolean;
  showRole?: boolean;
}

export default function DisplayUserData({
  userId,
  showName = false,
  showBannerImage = false,
  showDescription = false,
  showPhoneNumber = false,
  showAddress = false,
  showShopType = false,
  showRole = false,
}: DisplayUserDataProps) {
  const t = useTranslations();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const user = await getPublicUserDataById(userId);

        setUserData({
          bannerImage: user.shopDetails?.bannerImage,
          shopName: user.shopDetails?.shopName,
          shopPhone: user.shopDetails?.shopPhone,
          shopDescription: user.shopDetails?.shopDescription,
          shopAddress: user.shopDetails?.shopAddress,
          shopType: user.shopDetails?.shopType,
          role: user.role,
        });
      } catch (err: any) {
        setError(t("All.Error fetching user data"));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, t]);
  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div>
        <p className="text-red-600">...</p>
      </div>
    );
  }
  return (
    <div className="box-shadow-md px-2 rounded-md space-y-2 text-sm">
      {showName && userData.shopName && <p>{userData.shopName}</p>}
      {showBannerImage && userData.bannerImage && (
        <Image
          src={userData.bannerImage}
          alt={userData.shopName || "Banner Image"}
          className="w-full h-auto rounded-md"
        />
      )}
      {showPhoneNumber && userData.shopPhone && <p>{userData.shopPhone}</p>}
      {showDescription && userData.shopDescription && (
        <p>{userData.shopDescription}</p>
      )}
      {showAddress && userData.shopAddress && <p>{userData.shopAddress}</p>}
      {showShopType && userData.shopType && <p>{userData.shopType}</p>}

      {showRole && userData.role && (
        <p className="font-bold text-sm">
          {userData.role === "User"
            ? "Client"
            : userData.role === "Seller"
              ? "Vendeur"
              : userData.role === "Admin"
                ? "PYASTY"
                : ""}
        </p>
      )}
      {!showName &&
        !showBannerImage &&
        !showPhoneNumber &&
        !showDescription &&
        !showAddress &&
        !showShopType &&
        !showRole && <p>{t("All.No data selected")}</p>}
    </div>
  );
}
