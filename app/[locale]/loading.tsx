import { getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function LoadingPage() {
  const t = await getTranslations();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      <div className="p-6 rounded-lg shadow-md w-1/3 text-center">
        <Image
          src="/logo-load.png"
          width={800}
          height={500}
          alt="pyasti logo"
          className="mx-auto mb-4"
          style={{ width: "200px" }}
        />
        <p>{t("Loading.Loading")}</p>
      </div>
    </div>
  );
}
