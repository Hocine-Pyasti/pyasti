import * as React from "react";
import Link from "next/link";
import {
  X,
  ChevronRight,
  UserCircle,
  MenuIcon,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignOut } from "@/lib/actions/user.actions";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { auth } from "@/auth";
import { getLocale, getTranslations } from "next-intl/server";
import { getDirection } from "@/i18n-config";
import { getSubCategoryByMainCatId } from "@/lib/actions/subCategory.actions";

interface MainCategory {
  _id: string;
  name: string;
}

interface SubCategory {
  _id: string;
  name: string;
  slug: string;
}

export default async function Sidebar({
  mainCategories,
}: {
  mainCategories: MainCategory[];
}) {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations();
  const direction = getDirection(locale);

  // Pre-fetch subcategories for each main category
  const subCategoriesByMainCat = await Promise.all(
    mainCategories.map(async (mainCat) => ({
      mainCatId: mainCat._id,
      subCategories: await getSubCategoryByMainCatId(mainCat._id),
    }))
  );

  return (
    <Drawer direction={direction === "rtl" ? "right" : "left"}>
      <DrawerTrigger className="header-button flex items-center p-2">
        <MenuIcon className="h-5 w-5 mr-1" />
        {t("Header.All")}
      </DrawerTrigger>
      <DrawerContent className="w-[350px] mt-0 top-0 bg-card backdrop-blur-md">
        <div className="flex flex-col h-full">
          {/* User Sign In Section */}
          <div className="text-blue-500 border-b-2 border-blue-500 flex items-center justify-between">
            <DrawerHeader>
              <DrawerTitle className="flex items-center">
                <UserCircle className="h-6 w-6 mr-2" />
                {session ? (
                  <DrawerClose asChild>
                    <Link href="/account">
                      <span className="text-lg font-semibold">
                        {t("Header.Hello")}, {session.user.name}
                      </span>
                    </Link>
                  </DrawerClose>
                ) : (
                  <DrawerClose asChild>
                    <Link href="/sign-in">
                      <span className="text-lg font-semibold">
                        {t("Header.Hello")}, {t("Header.sign in")}
                      </span>
                    </Link>
                  </DrawerClose>
                )}
              </DrawerTitle>
            </DrawerHeader>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </DrawerClose>
          </div>

          {/* Shop By Category */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">
                {t("Header.Shop By Department")}
              </h2>
            </div>
            <nav
              className="flex flex-col"
              role="navigation"
              aria-label="Main categories"
            >
              {mainCategories.map((mainCat) => {
                const subCategories =
                  subCategoriesByMainCat.find(
                    (item) => item.mainCatId === mainCat._id
                  )?.subCategories || [];
                return (
                  <div key={mainCat._id} className="group">
                    <button
                      className="flex items-center justify-between w-full item-button focus:outline-none"
                      aria-expanded={
                        subCategories.length > 0 ? "false" : undefined
                      }
                      aria-controls={`submenu-${mainCat._id}`}
                    >
                      <span>{mainCat.name}</span>
                      {subCategories.length > 0 && (
                        <ChevronDown className="h-4 w-4 group-hover:rotate-180 transition-transform" />
                      )}
                    </button>
                    {subCategories.length > 0 && (
                      <div
                        id={`submenu-${mainCat._id}`}
                        className="pl-4 hidden group-hover:block bg-muted"
                        role="menu"
                        aria-label={`Subcategories for ${mainCat.name}`}
                      >
                        {subCategories.map((subCat: SubCategory) => (
                          <DrawerClose asChild key={subCat._id}>
                            <Link
                              href={`/search?subCategory=${subCat._id}`}
                              className="flex items-center justify-between item-button text-sm py-2"
                              role="menuitem"
                            >
                              <span>{subCat.name}</span>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </DrawerClose>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Setting and Help */}
          <div className="border-t flex flex-col">
            <div className="p-4">
              <h2 className="text-lg font-semibold">
                {t("Header.Help & Settings")}
              </h2>
            </div>
            <DrawerClose asChild>
              <Link href="/account" className="item-button">
                {t("Header.Your account")}
              </Link>
            </DrawerClose>
            <DrawerClose asChild>
              <Link href="/page/customer-service" className="item-button">
                {t("Header.Customer Service")}
              </Link>
            </DrawerClose>
            {session ? (
              <form action={SignOut} className="w-full">
                <Button
                  className="w-full justify-start item-button text-base"
                  variant="ghost"
                  type="submit"
                >
                  {t("Header.Sign out")}
                </Button>
              </form>
            ) : (
              <DrawerClose asChild>
                <Link href="/sign-in" className="item-button">
                  {t("Header.Sign in")}
                </Link>
              </DrawerClose>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
