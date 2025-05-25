import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";

// 마커 아이콘 설정 (기본 마커 아이콘 문제 해결)
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

L.Marker.prototype.options.icon = defaultIcon;

const WeddingMap = ({ weddingHalls }) => {
  const gangnamCenter = [37.5173, 127.0473]; // 강남 좌표

  return (
    <MapContainer center={gangnamCenter} zoom={12} style={{ height: "500px" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {weddingHalls.map((hall) => (
        <Marker
          key={hall.id}
          position={[hall.lng / 10000000, hall.lat / 10000000]}
        >
          <Popup>
            <div>
              <h3>{hall.name}</h3>
              <p>{hall.address}</p>
              <Link href={`/wedding-hall/${hall.id}`}>
                <a>상세 정보</a>
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default WeddingMap;
