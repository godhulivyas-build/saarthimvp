import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type MapMarkerKind = 'mandi' | 'buyer' | 'transporter' | 'farmer';

export type MapMarkerData = {
  lat: number;
  lng: number;
  label: string;
  kind: MapMarkerKind;
};

const KIND_COLOR: Record<MapMarkerKind, string> = {
  mandi: '#2563eb',
  buyer: '#059669',
  transporter: '#d97706',
  farmer: '#7c3aed',
};

const KIND_ICON: Record<MapMarkerKind, string> = {
  mandi: '\u{1F3DB}',
  buyer: '\u{1F91D}',
  transporter: '\u{1F69A}',
  farmer: '\u{1F33E}',
};

function makeIcon(kind: MapMarkerKind): L.DivIcon {
  return L.divIcon({
    className: 'sarthi-leaflet-pin',
    html: `<div style="width:32px;height:32px;border-radius:50%;background:${KIND_COLOR[kind]};display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);font-size:15px">${KIND_ICON[kind]}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

type Props = {
  markers: MapMarkerData[];
  heightClass?: string;
};

/** Free OpenStreetMap tiles + raw Leaflet — no Google Maps key required. */
export const LiveMapView: React.FC<Props> = ({ markers, heightClass = 'h-[360px]' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoom: 8, center: [22.9, 76.0], scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    if (markers.length === 0) return;

    const bounds: [number, number][] = [];
    markers.forEach((m) => {
      L.marker([m.lat, m.lng], { icon: makeIcon(m.kind) })
        .bindTooltip(m.label, { direction: 'top', offset: [0, -14] })
        .addTo(layer);
      bounds.push([m.lat, m.lng]);
    });

    if (bounds.length === 1) {
      map.setView(bounds[0], 10);
    } else {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [markers]);

  return (
    <div
      ref={containerRef}
      className={`${heightClass} w-full rounded-2xl overflow-hidden border border-emerald-100 dark:border-emerald-900 z-0`}
    />
  );
};
