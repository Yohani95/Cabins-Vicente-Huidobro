"use client";

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';

// Crear icono SVG personalizado
const createCustomIcon = () => {
  const svgIcon = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#3b82f6" stroke="#1e40af" stroke-width="2" 
        d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
    </svg>
  `;
  
  const iconUrl = 'data:image/svg+xml;base64,' + btoa(svgIcon);
  
  return L.icon({
    iconUrl: iconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });
};

type MapComponentProps = {
  position: [number, number];
  title?: string;
  description?: string;
};

export default function MapComponent({
  position,
  title,
  description
}: MapComponentProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current) {
      return;
    }

    if (!mapRef.current) {
      const mapInstance = L.map(containerRef.current, {
        center: position,
        zoom: 16,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors'
      }).addTo(mapInstance);

      // Usar el icono personalizado SVG
      const customIcon = createCustomIcon();

      const markerInstance = L.marker(position, { icon: customIcon }).addTo(mapInstance);
      markerInstance.bindPopup('Vicente Huidobro 545 · Cartagena');

      mapRef.current = mapInstance;
      markerRef.current = markerInstance;
    } else {
      mapRef.current.setView(position);
      markerRef.current?.setLatLng(position);
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [isClient, position]);

  return (
    <div className="relative h-full">
      <div ref={containerRef} className="h-full w-full" />
      {(title || description) && (
        <div className="pointer-events-none absolute bottom-4 left-4 max-w-xs rounded-2xl border border-sand/50 bg-white/80 p-4 shadow-lg backdrop-blur">
          {title && <p className="text-sm font-semibold text-olive">{title}</p>}
          {description && (
            <p className="mt-1 text-xs text-slate-600">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}




