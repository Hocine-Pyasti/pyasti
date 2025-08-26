import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getAllSubCategories } from "@/lib/actions/subCategory.actions";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { getSetting } from "@/lib/actions/setting.actions";
import { getTranslations } from "next-intl/server";

export default async function Search() {
  const {
    site: { name },
  } = await getSetting();

  const subCategories = await getAllSubCategories({ query: "" });

  const t = await getTranslations();
  return (
    <form action="/search" method="GET" className="flex  items-stretch h-10 ">
      <Select name="category">
        <SelectTrigger className="hidden md:flex w-auto h-full dark:border-gray-200 bg-gray-100 text-black border-r  rounded-r-none rounded-l-md rtl:rounded-r-md rtl:rounded-l-none  ">
          <SelectValue placeholder={t("Header.All")} />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="all">{t("Header.All")}</SelectItem>
          {subCategories.subCategories.map((category) => (
            <SelectItem key={category.id} value={category.name}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        className="flex-1 rounded-l-md md:rounded-none dark:border-gray-200 bg-gray-100 text-black text-base h-full"
        placeholder={t("Header.Search Site", { name })}
        name="q"
        type="search"
      />
      <button
        type="submit"
        className="bg-primary text-primary-foreground text-black rounded-s-none rounded-e-md h-full px-3 py-2 "
      >
        <SearchIcon className="w-6 h-6" />
      </button>
    </form>
  );
}
