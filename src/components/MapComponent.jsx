import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ initialPosition, onLocationSelect, disabled }) => {
  const [position, setPosition] = useState(initialPosition);
  const markerRef = useRef(null);

  
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  useMapEvents({
    click(e) {
      if (!disabled) {
        const newPosition = e.latlng;
        setPosition(newPosition);
        onLocationSelect(newPosition);
      }
    },
  });

  return position === null ? null : (
    <Marker
      position={position}
      ref={markerRef}
      eventHandlers={{
        dragend: () => {
          if (!disabled && markerRef.current) {
            const marker = markerRef.current;
            if (marker != null) {
              const newPosition = marker.getLatLng();
              setPosition(newPosition);
              onLocationSelect(newPosition);
            }
          }
        },
      }}
      draggable={!disabled}
    >
      <Popup>
        <div>
          <strong>Ubicación seleccionada</strong>
          <br />
          Lat: {position.lat.toFixed(6)}
          <br />
          Lng: {position.lng.toFixed(6)}
        </div>
      </Popup>
    </Marker>
  );
};

const MapComponent = ({ onLocationSelect, initialPosition, mapCenter = null, disabled = false }) => {
  const safeInitialPosition = {
    lat: Number(initialPosition.lat) || -16.5000,
    lng: Number(initialPosition.lng) || -68.1193
  };

  const safeMapCenter = mapCenter ? {
    lat: Number(mapCenter.lat) || safeInitialPosition.lat,
    lng: Number(mapCenter.lng) || safeInitialPosition.lng
  } : safeInitialPosition;

  return (
    <div className="h-64 w-full rounded-md overflow-hidden border border-gray-300">
      <MapContainer
        center={[safeMapCenter.lat, safeMapCenter.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="rounded-md"
        key={`${safeMapCenter.lat}-${safeMapCenter.lng}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          initialPosition={safeInitialPosition}
          onLocationSelect={onLocationSelect}
          disabled={disabled}
        />
      </MapContainer>
    </div>
  );
};

export default MapComponent;