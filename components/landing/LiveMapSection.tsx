import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MP_DISTRICTS, MP_CENTER, type MPDistrict } from '../../config/mpLocations.ts';
import { useI18n } from '../../i18n/I18nContext.tsx';

type MapMarker = MPDistrict & { farmers: number; loads: number };

function generateMarkers(): MapMarker[] {
  return MP_DISTRICTS.filter(() => Math.random() > 0.4).map((d) => ({
    ...d,
    farmers: 5 + Math.floor(Math.random() * 50),
    loads: Math.floor(Math.random() * 15),
  }));
}

const LiveMapSection: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const { lang } = useI18n();
  const [markers] = useState<MapMarker[]>(generateMarkers);
  const isHi = lang === 'hi';

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: [MP_CENTER.lat, MP_CENTER.lng],
      zoom: 6,
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 12,
    }).addTo(map);

    markers.forEach((m) => {
      const color = m.loads > 5 ? '#dc2626' : m.farmers > 20 ? '#16a34a' : '#f59e0b';
      const radius = Math.min(8 + m.farmers * 0.3, 18);

      const circle = L.circleMarker([m.lat, m.lng], {
        radius,
        fillColor: color,
        color: '#fff',
        weight: 1.5,
        fillOpacity: 0.75,
      }).addTo(map);

      const label = isHi ? m.nameHi : m.name;
      circle.bindPopup(
        `<div style="text-align:center;font-family:Inter,sans-serif">
          <strong style="font-size:14px">${label}</strong><br/>
          <span style="color:#16a34a">🌾 ${m.farmers} ${isHi ? 'किसान' : 'farmers'}</span><br/>
          <span style="color:#dc2626">🚛 ${m.loads} ${isHi ? 'लोड' : 'loads'}</span>
        </div>`
      );
    });

    leafletMap.current = map;

    // Force a re-render after a brief delay so tiles load correctly
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  const totalFarmers = markers.reduce((s, m) => s + m.farmers, 0);
  const totalLoads = markers.reduce((s, m) => s + m.loads, 0);

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-2 anim-fade-up">
          {isHi ? '🗺️ मध्य प्रदेश — लाइव गतिविधि' : '🗺️ Madhya Pradesh — Live Activity'}
        </h2>
        <p className="text-center text-gray-500 mb-8 anim-fade-up anim-delay-1">
          {isHi
            ? 'किसान, लोड, और मंडी गतिविधि देखें — रियल टाइम'
            : 'See farmers, loads, and mandi activity — real-time'}
        </p>

        <div className="flex justify-center gap-8 mb-6 anim-fade-up anim-delay-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
            <span className="text-sm">{isHi ? `${totalFarmers} किसान सक्रिय` : `${totalFarmers} active farmers`}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 inline-block" />
            <span className="text-sm">{isHi ? `${totalLoads} लोड चल रहे` : `${totalLoads} loads in transit`}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="text-sm">{isHi ? 'नए क्षेत्र' : 'Emerging areas'}</span>
          </div>
        </div>

        <div
          ref={mapRef}
          className="w-full h-[420px] rounded-xl border border-gray-200 shadow-lg anim-scale anim-delay-2"
          style={{ zIndex: 0 }}
        />
      </div>
    </section>
  );
};

export default LiveMapSection;
