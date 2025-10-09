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
  bannerImageStyle?: string;
  nameStyle?: string;
  shopDataStyle?: string;
  divStyles?: string;
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
  bannerImageStyle?: string;
  nameStyle?: string;
  shopDataStyle?: string;
  divStyles?: string;
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
  bannerImageStyle,
  nameStyle,
  shopDataStyle,
  divStyles,
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
      <div className={divStyles}>
        {showBannerImage && userData.bannerImage && (
          <Image
            src={userData.bannerImage || "/public/avatars/shop4.jpg"}
            alt={userData.shopName || "Banner Image"}
            className={`${bannerImageStyle} object-cover object-center`}
            width={1000}
            height={1000}
          />
        )}
        <div className="ml-1">
          {showName && userData.shopName && (
            <p className={nameStyle}>{userData.shopName}</p>
          )}
          <div className={shopDataStyle}>
            {showPhoneNumber && userData.shopPhone && (
              <p>{userData.shopPhone}</p>
            )}
            {showAddress && userData.shopAddress && (
              <p>{userData.shopAddress}</p>
            )}
            {showShopType && userData.shopType && (
              <p className="bg-green-200 px-2 rounded-lg text-green-800">
                {userData.shopType === "Physical Shop"
                  ? t("Auth.Physical Shop.title")
                  : userData.shopType === "Online Shop"
                    ? t("Auth.Online Shop.title")
                    : userData.shopType === "Physical and Online Shop"
                      ? t("Auth.Physical and Online Shop.title")
                      : userData.shopType === "Repair Workshop with Sales"
                        ? t("Auth.Repair Workshop with Sales.title")
                        : userData.shopType === "Specialized Distributor"
                          ? t("Auth.Specialized Distributor.title")
                          : userData.shopType === "Automotive Recycler"
                            ? t("Auth.Automotive Recycler.title")
                            : userData.shopType === "Custom Manufacturer"
                              ? t("Auth.Custom Manufacturer.title")
                              : userData.shopType === "Collection Point"
                                ? t("Auth.Collection Point.title")
                                : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {showDescription && userData.shopType && (
        <p>
          {userData.shopType === "Physical Shop"
            ? t("Auth.Physical Shop.description")
            : userData.shopType === "Online Shop"
              ? t("Auth.Online Shop.description")
              : userData.shopType === "Physical and Online Shop"
                ? t("Auth.Physical and Online Shop.description")
                : userData.shopType === "Repair Workshop with Sales"
                  ? t("Auth.Repair Workshop with Sales.description")
                  : userData.shopType === "Specialized Distributor"
                    ? t("Auth.Specialized Distributor.description")
                    : userData.shopType === "Automotive Recycler"
                      ? t("Auth.Automotive Recycler.description")
                      : userData.shopType === "Custom Manufacturer"
                        ? t("Auth.Custom Manufacturer.description")
                        : userData.shopType === "Collection Point"
                          ? t("Auth.Collection Point.description")
                          : t("Auth.Select Type")}
        </p>
      )}

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
