"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTranslations } from "next-intl";
import { getAllSellersForMap } from "@/lib/actions/user.actions";
import NextLink from "next/link";
import { Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

const shopIcon = new L.Icon({
  iconUrl: "/images/shop-marker.png",
  iconSize: [32, 42],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowSize: [32, 32],
});

const MapPage = () => {
  const t = useTranslations();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const data = await getAllSellersForMap();
        console.log(data);
        setSellers(data || []);
      } catch (err) {
        setError((err as Error).message || "Failed to fetch sellers");
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, []);

  if (loading) {
    return <p className="text-center text-muted-foreground">{t("Loading")}</p>;
  }

  if (error) {
    return <p className="text-center text-destructive">{error}</p>;
  }

  return (
    <div className="my-10 mx-2 md:mx-10 lg:mx-20 rounded-lg shadow-lg border-2 border-blue-700">
      <MapContainer
        center={[36.743637, 5.08697]}
        zoom={6}
        style={{ height: "70vh", width: "100%", borderRadius: "8px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {sellers.map((seller) => {
          if (!seller.latitude || !seller.longitude) return null;

          const position: [number, number] = [
            parseFloat(seller.latitude),
            parseFloat(seller.longitude),
          ];

          return (
            <Marker
              key={seller._id}
              position={position}
              icon={shopIcon}
              title={seller.shopDetails?.shopName || "Shop"}
            >
              <Popup>
                <div className="space-y-1">
                  <h3 className="font-semibold">
                    {seller.shopDetails?.shopName}
                  </h3>
                  <p>
                    {t("All.Phone Number")}: {seller.shopDetails?.shopPhone}
                  </p>
                  <p>
                    {t("All.Address")}: {seller.shopDetails?.shopAddress}
                  </p>

                  <p className="bg-green-200 px-2 rounded-lg text-green-800 font-bold">
                    {seller.shopDetails?.shopType === "Physical Shop"
                      ? t("Auth.Physical Shop.title")
                      : seller.shopDetails?.shopType === "Online Shop"
                        ? t("Auth.Online Shop.title")
                        : seller.shopDetails?.shopType ===
                            "Physical and Online Shop"
                          ? t("Auth.Physical and Online Shop.title")
                          : seller.shopDetails?.shopType ===
                              "Repair Workshop with Sales"
                            ? t("Auth.Repair Workshop with Sales.title")
                            : seller.shopDetails?.shopType ===
                                "Specialized Distributor"
                              ? t("Auth.Specialized Distributor.title")
                              : seller.shopDetails?.shopType ===
                                  "Automotive Recycler"
                                ? t("Auth.Automotive Recycler.title")
                                : seller.shopDetails?.shopType ===
                                    "Custom Manufacturer"
                                  ? t("Auth.Custom Manufacturer.title")
                                  : seller.shopDetails?.shopType ===
                                      "Collection Point"
                                    ? t("Auth.Collection Point.title")
                                    : ""}
                  </p>
                  <NextLink href={`/seller-shop/${seller._id}`} passHref>
                    <Button className="flex items-center gap-2 w-full justify-center mt-2">
                      <LinkIcon className="w-4 h-4" />
                      {t("Product.View Seller")}
                    </Button>
                  </NextLink>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapPage;
