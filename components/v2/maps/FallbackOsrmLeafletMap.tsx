import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLng, DrivingRouteResult } from '../../../services/maps/routePlanning';
import { fetchOsrmDrivingRoute } from '../../../services/maps/routePlanning';

type PlaceMode = 'pickup' | 'drop';

type Props = {
  pickup: LatLng;
  drop: LatLng;
  onPickupChange: (p: LatLng) => void;
  onDropChange: (p: LatLng) => void;
  placeMode: PlaceMode;
  routePath: LatLng[] | null;
  onRouteComputed: (r: DrivingRouteResult | null) => void;
};

/**
 * Free map tiles (OpenStreetMap) + OSRM public routing when no Google Maps key.
 */
export const FallbackOsrmLeafletMap: React.FC<Props> = ({
  pickup,
  drop,
  onPickupChange,
  onDropChange,
  placeMode,
  routePath,
  onRouteComputed,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropMarkerRef = useRef<L.Marker | null>(null);
  const lineRef = useRef<L.Polyline | null>(null);

  const placeModeRef = useRef(placeMode);
  const onPickRef = useRef(onPickupChange);
  const onDropRef = useRef(onDropChange);
  const onRouteRef = useRef(onRouteComputed);

  useEffect(() => {
    placeModeRef.current = placeMode;
  }, [placeMode]);
  useEffect(() => {
    onPickRef.current = onPickupChange;
    onDropRef.current = onDropChange;
  }, [onPickupChange, onDropChange]);
  useEffect(() => {
    onRouteRef.current = onRouteComputed;
  }, [onRouteComputed]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [(pickup.lat + drop.lat) / 2, (pickup.lng + drop.lng) / 2],
      zoom: 7,
      scrollWheelZoom: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const iconA = L.divIcon({
      className: 'saarthi-leaflet-pin',
      html: '<div style="width:28px;height:28px;border-radius:50%;background:#166534;color:#fff;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.25)">A</div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    const iconB = L.divIcon({
      className: 'saarthi-leaflet-pin',
      html: '<div style="width:28px;height:28px;border-radius:50%;background:#c2410c;color:#fff;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.25)">B</div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const mA = L.marker([pickup.lat, pickup.lng], { draggable: true, icon: iconA }).addTo(map);
    const mB = L.marker([drop.lat, drop.lng], { draggable: true, icon: iconB }).addTo(map);
    pickupMarkerRef.current = mA;
    dropMarkerRef.current = mB;

    mA.on('dragend', () => {
      const p = mA.getLatLng();
      onPickRef.current({ lat: p.lat, lng: p.lng });
    });
    mB.on('dragend', () => {
      const p = mB.getLatLng();
      onDropRef.current({ lat: p.lat, lng: p.lng });
    });

    map.on('click', (ev: L.LeafletMouseEvent) => {
      const { lat, lng } = ev.latlng;
      if (placeModeRef.current === 'pickup') {
        mA.setLatLng([lat, lng]);
        onPickRef.current({ lat, lng });
      } else {
        mB.setLatLng([lat, lng]);
        onDropRef.current({ lat, lng });
      }
    });

    mapRef.current = map;
    const bounds = L.latLngBounds([pickup.lat, pickup.lng], [drop.lat, drop.lng]);
    map.fitBounds(bounds, { padding: [36, 36] });

    return () => {
      map.remove();
      mapRef.current = null;
      pickupMarkerRef.current = null;
      dropMarkerRef.current = null;
      lineRef.current = null;
    };
    // Map is created once; marker positions sync in the following effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mA = pickupMarkerRef.current;
    const mB = dropMarkerRef.current;
    if (!mA || !mB) return;
    mA.setLatLng([pickup.lat, pickup.lng]);
    mB.setLatLng([drop.lat, drop.lng]);
  }, [pickup.lat, pickup.lng, drop.lat, drop.lng]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (lineRef.current) {
      map.removeLayer(lineRef.current);
      lineRef.current = null;
    }
    if (routePath && routePath.length > 1) {
      const latlngs = routePath.map((p) => [p.lat, p.lng] as L.LatLngExpression);
      const poly = L.polyline(latlngs, { color: '#15803d', weight: 5, opacity: 0.9 }).addTo(map);
      lineRef.current = poly;
      try {
        map.fitBounds(poly.getBounds(), { padding: [40, 40] });
      } catch {
        // ignore invalid bounds
      }
    }
  }, [routePath]);

  useEffect(() => {
    let cancelled = false;
    onRouteRef.current(null);
    fetchOsrmDrivingRoute(pickup, drop).then((r) => {
      if (!cancelled) onRouteRef.current(r);
    });
    return () => {
      cancelled = true;
    };
  }, [pickup.lat, pickup.lng, drop.lat, drop.lng]);

  return <div ref={containerRef} className="h-[min(52vh,440px)] min-h-[280px] w-full rounded-2xl overflow-hidden border-2 border-[var(--saarthi-surface-high)] z-0" />;
};
