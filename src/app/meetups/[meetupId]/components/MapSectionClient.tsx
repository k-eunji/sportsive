// src/app/meetups/[meetupId]/components/MapSectionClient.tsx

"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

interface MapSectionClientProps {
  lat: number;
  lng: number;
  locationName: string;
  hostAvatarUrl?: string;
  editable?: boolean; // 지도에서 위치 변경 가능 여부
  onPositionChange?: (lat: number, lng: number) => void; // 부모 컴포넌트에 변경 좌표 전달
}

// ✅ 커스텀 아바타 마커 아이콘 생성
function createAvatarIcon(avatarUrl: string) {
  return L.divIcon({
    html: `
      <div
        style="
          width: 44px;
          height: 44px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          background: white;
        "
      >
        <img
          src="${avatarUrl}"
          alt="Host avatar"
          style="width:100%;height:100%;object-fit:cover;"
        />
      </div>
    `,
    className: "",
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -40],
  });
}

// ✅ 지도의 중심을 동적으로 리셋
function ResetCenterView({ lat, lng }: { lat: number; lng: number }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

// ✅ 지도 클릭 이벤트 → 좌표 반환
function LocationPicker({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ✅ 메인 지도 컴포넌트
export default function MapSectionClient({
  lat,
  lng,
  locationName,
  hostAvatarUrl = "https://cdn-icons-png.flaticon.com/512/847/847969.png",
  editable = false,
  onPositionChange,
}: Readonly<MapSectionClientProps>) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      scrollWheelZoom={false}
      className="h-full w-full z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      />

      <Marker position={[lat, lng]} icon={createAvatarIcon(hostAvatarUrl)}>
        <Popup>{locationName}</Popup>
      </Marker>

      {editable && onPositionChange && (
        <LocationPicker onSelect={onPositionChange} />
      )}

      <ResetCenterView lat={lat} lng={lng} />
    </MapContainer>
  );
}
