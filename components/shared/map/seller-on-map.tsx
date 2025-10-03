"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { getUserById } from "@/lib/actions/user.actions";

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

interface SellerOnMapProps {
  sellerId: string;
  clientId?: string; // Made optional
}

const SellerOnMap: React.FC<SellerOnMapProps> = ({ sellerId, clientId }) => {
  const t = useTranslations("All");
  const [sellerPosition, setSellerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [clientPosition, setClientPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sellerData = await getUserById(sellerId);

        if (!sellerData || !sellerData.latitude || !sellerData.longitude) {
          throw new Error("Seller location not available");
        }

        const sellerLatLng = {
          lat: parseFloat(sellerData.latitude),
          lng: parseFloat(sellerData.longitude),
        };
        setSellerPosition(sellerLatLng);

        if (clientId) {
          const clientData = await getUserById(clientId);

          if (!clientData || !clientData.latitude || !clientData.longitude) {
            setShowLoginMessage(true); // If client data missing, assume not logged in
          } else {
            const clientLatLng = {
              lat: parseFloat(clientData.latitude),
              lng: parseFloat(clientData.longitude),
            };
            setClientPosition(clientLatLng);

            // Calculate distance
            const dist =
              L.latLng(sellerLatLng.lat, sellerLatLng.lng).distanceTo(
                L.latLng(clientLatLng.lat, clientLatLng.lng)
              ) / 1000; // Convert to KM
            setDistance(dist);
          }
        } else {
          setShowLoginMessage(true); // No clientId provided
        }
      } catch (err) {
        setError((err as Error).message || "Failed to fetch location data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sellerId, clientId]);

  const openInGoogleMaps = () => {
    if (sellerPosition) {
      const url = `https://www.google.com/maps/search/?api=1&query=${sellerPosition.lat},${sellerPosition.lng}`;
      window.open(url, "_blank");
    }
  };

  if (loading) {
    return <p className="text-center text-muted-foreground">{t("Loading")}</p>;
  }

  if (error || !sellerPosition) {
    return (
      <p className="text-center text-destructive">
        {error || t("no_location")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {showLoginMessage ? (
        <p className="text-center font-semibold text-muted-foreground">
          {t("please_login_to_see_distance")}
        </p>
      ) : (
        <p className="text-center font-semibold">
          {t("distance")}: {distance?.toFixed(2) ?? "N/A"} KM
        </p>
      )}
      <div className="w-full h-64 border rounded-md overflow-hidden">
        <MapContainer
          center={sellerPosition}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={sellerPosition} icon={shopIcon} />
        </MapContainer>
      </div>
      <Button onClick={openInGoogleMaps} className="w-full">
        {t("open_on_map")}
      </Button>
    </div>
  );
};

export default SellerOnMap;
