import React, { useCallback, useEffect, useRef } from 'react';
import { APIProvider, AdvancedMarker, Map, Pin, useMap } from '@vis.gl/react-google-maps';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapsEnabled, GOOGLE_MAPS_API_KEY } from '../../../services/maps/googleMapsConfig';

type LatLng = { lat: number; lng: number };

function FitPin({ position }: { position: LatLng }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.panTo(position);
    map.setZoom(Math.max(map.getZoom() ?? 12, 14));
  }, [map, position.lat, position.lng]);
  return null;
}

type InnerProps = {
  position: LatLng;
  onChange: (p: LatLng) => void;
};

const GoogleSinglePin: React.FC<InnerProps> = ({ position, onChange }) => {
  const onDrag = useCallback(
    (e: google.maps.MapMouseEvent) => {
      const ll = e.latLng?.toJSON?.();
      if (ll) onChange(ll);
    },
    [onChange]
  );

  const onClick = useCallback(
    (e: { detail: { latLng: google.maps.LatLngLiteral | null } }) => {
      const ll = e.detail?.latLng;
      if (ll) onChange(ll);
    },
    [onChange]
  );

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['marker']}>
      <div className="h-[220px] w-full rounded-2xl overflow-hidden border-2 border-[var(--saarthi-surface-high)]">
        <Map
          defaultCenter={position}
          defaultZoom={14}
          gestureHandling="greedy"
          mapTypeControl={false}
          streetViewControl={false}
          style={{ width: '100%', height: '100%' }}
          onClick={onClick}
        >
          <FitPin position={position} />
          <AdvancedMarker position={position} draggable title="Base" onDragEnd={onDrag}>
            <Pin background="#166534" borderColor="#14532d" glyphColor="#fff" glyphText="⌂" />
          </AdvancedMarker>
        </Map>
      </div>
    </APIProvider>
  );
};

const LeafletSinglePin: React.FC<InnerProps> = ({ position, onChange }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { center: [position.lat, position.lng], zoom: 14, scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);
    const icon = L.divIcon({
      className: 'saarthi-pin-single',
      html: '<div style="width:26px;height:26px;border-radius:50%;background:#166534;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.2)">⌂</div>',
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });
    const m = L.marker([position.lat, position.lng], { draggable: true, icon }).addTo(map);
    markerRef.current = m;
    m.on('dragend', () => {
      const p = m.getLatLng();
      onChangeRef.current({ lat: p.lat, lng: p.lng });
    });
    map.on('click', (ev: L.LeafletMouseEvent) => {
      const { lat, lng } = ev.latlng;
      m.setLatLng([lat, lng]);
      onChangeRef.current({ lat, lng });
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    markerRef.current?.setLatLng([position.lat, position.lng]);
    mapRef.current?.panTo([position.lat, position.lng]);
  }, [position.lat, position.lng]);

  return <div ref={ref} className="h-[220px] w-full rounded-2xl overflow-hidden border-2 border-[var(--saarthi-surface-high)] z-0" />;
};

type Props = {
  lat: number | null;
  lng: number | null;
  defaultCenter: LatLng;
  onChange: (lat: number, lng: number) => void;
};

/** One draggable pin: Google Maps if key set, else OSM + Leaflet (free). */
export const SinglePinLocationMap: React.FC<Props> = ({ lat, lng, defaultCenter, onChange }) => {
  const pos = lat != null && lng != null ? { lat, lng } : defaultCenter;
  const handle = useCallback((p: LatLng) => onChange(p.lat, p.lng), [onChange]);

  if (mapsEnabled()) {
    return <GoogleSinglePin position={pos} onChange={handle} />;
  }
  return <LeafletSinglePin position={pos} onChange={handle} />;
};
