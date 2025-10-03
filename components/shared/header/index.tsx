import Image from "next/image";
import Link from "next/link";
// import { getAllCategories } from "@/lib/actions/product.actions";
import { getAllMainCategories } from "@/lib/actions/mainCategory.actions";
import Menu from "./menu";
import Search from "./search";
import data from "@/lib/data";
import Sidebar from "./sidebar";
import { getSetting } from "@/lib/actions/setting.actions";
import { getTranslations } from "next-intl/server";

export default async function Header() {
  const mainCategories = await getAllMainCategories({ query: "" });
  const { site } = await getSetting();
  const t = await getTranslations();
  return (
    <header className="bg-black  text-white z-50 border-b-4 border-blue-700">
      <div className="px-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center header-button font-extrabold text-2xl m-1 "
            >
              <Image
                src="/logo.png"
                width={1900}
                height={1000}
                alt={`${site.name} logo`}
                className="w-40"
              />
            </Link>
          </div>

          <div className="hidden md:block flex-1 max-w-xl">
            <Search />
          </div>
          <Menu />
        </div>
        <div className="md:hidden block py-2">
          <Search />
        </div>
      </div>
      <div className="flex items-center px-3 mb-[-22px] bg-blue-700 w-[90%] mx-auto rounded-xl ">
        <Sidebar mainCategories={mainCategories.mainCategories} />
        <div className="flex items-center flex-wrap gap-3 overflow-hidden   max-h-[42px]">
          {data.headerMenus.map((menu) => (
            <Link
              href={menu.href}
              key={menu.href}
              className="header-button !p-2 "
            >
              {t("Header." + menu.name)}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
