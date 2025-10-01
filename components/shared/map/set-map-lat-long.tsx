"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTranslations } from "next-intl";

interface SetMapLatLongProps {
  onLocationChange: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

const customMarkerIcon = L.icon({
  iconUrl: "/images/marker.png",
  iconSize: [32, 41], // Adjust based on your icon dimensions
  iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
  popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
});

const MapCenterUpdater = ({
  position,
}: {
  position: { lat: number; lng: number };
}) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true });
  }, [position, map]);
  return null;
};

const SetMapLatLong: React.FC<SetMapLatLongProps> = ({
  onLocationChange,
  initialLat,
  initialLng,
}) => {
  const t = useTranslations("Map");
  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: initialLat || 36.743637,
    lng: initialLng || 5.08697,
  });
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition({ lat: latitude, lng: longitude });
          onLocationChange(latitude, longitude);
        },
        () => {
          // Fallback to default if geolocation fails
          setPosition({ lat: 36.743637, lng: 5.08697 });
          onLocationChange(36.743637, 5.08697);
        },
        { enableHighAccuracy: true }
      );
    } else {
      // Fallback if geolocation not supported
      setPosition({ lat: 36.743637, lng: 5.08697 });
      onLocationChange(36.743637, 5.08697);
    }
  }, [onLocationChange]);

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
        onLocationChange(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  return (
    <div className="w-full h-96 border rounded-md overflow-hidden">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEvents />
        <MapCenterUpdater position={position} />
        <Marker
          position={position}
          draggable={true}
          icon={customMarkerIcon}
          eventHandlers={{
            dragend: () => {
              if (markerRef.current) {
                const { lat, lng } = markerRef.current.getLatLng();
                setPosition({ lat, lng });
                onLocationChange(lat, lng);
              }
            },
          }}
          ref={markerRef}
        />
      </MapContainer>
      <p className="text-sm text-muted-foreground mt-2">
        {t("drag_marker")}
        {/* Assuming translation: "Drag the marker or click on the map to set your location" */}
      </p>
    </div>
  );
};

export default SetMapLatLong;
