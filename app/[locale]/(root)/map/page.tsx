"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTranslations } from "next-intl";
import { getAllSellersForMap } from "@/lib/actions/user.actions";

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
  const t = useTranslations("All");
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
                    {t("Phone Number")}: {seller.shopDetails?.shopPhone}
                  </p>
                  <p>
                    {t("Address")}: {seller.shopDetails?.shopAddress}
                  </p>
                  <p>
                    {t("Type")}: {seller.shopDetails?.shopType}
                  </p>
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
