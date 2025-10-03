import { Data, IProductInput, IUserInput } from "@/types";
import { toSlug } from "./utils";
import bcrypt from "bcryptjs";
import { i18n } from "@/i18n-config";

const users: IUserInput[] = [];

const products: IProductInput[] = [];
const reviews: any[] = [];

const data: Data = {
  users,
  products,
  reviews,
  webPages: [],
  headerMenus: [
    {
      name: "Map",
      href: "/map",
    },
    {
      name: "Today's Deal",
      href: "/search?tag=todays-deal",
    },
    {
      name: "New Arrivals",
      href: "/search?tag=new-arrival",
    },
    {
      name: "Featured Products",
      href: "/search?tag=featured",
    },
    {
      name: "Best Sellers",
      href: "/search?tag=best-seller",
    },
    {
      name: "Browsing History",
      href: "/#browsing-history",
    },
    {
      name: "Customer Service",
      href: "/page/customer-service",
    },
    {
      name: "About Us",
      href: "/page/about-us",
    },
    {
      name: "Help",
      href: "/page/help",
    },
  ],
  carousels: [],
  settings: [],
};

export default data;
