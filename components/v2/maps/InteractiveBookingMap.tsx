import React, { useCallback, useEffect, useRef } from 'react';
import { AdvancedMarker, Map, Pin, Polyline, useApiIsLoaded, useMap } from '@vis.gl/react-google-maps';
import type { LatLng, DrivingRouteResult } from '../../../services/maps/routePlanning';
import { fetchGoogleDrivingRoute } from '../../../services/maps/routePlanning';

type PlaceMode = 'pickup' | 'drop';

function FitRouteBounds({
  pickup,
  drop,
  path,
}: {
  pickup: LatLng;
  drop: LatLng;
  path: LatLng[] | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map || !window.google?.maps) return;
    const b = new window.google.maps.LatLngBounds();
    b.extend(pickup);
    b.extend(drop);
    if (path?.length) {
      path.forEach((p) => b.extend(p));
    }
    map.fitBounds(b, { top: 40, right: 24, bottom: 24, left: 24 });
  }, [map, pickup.lat, pickup.lng, drop.lat, drop.lng, path]);
  return null;
}

function RouteFromDirections({
  pickup,
  drop,
  onRoute,
}: {
  pickup: LatLng;
  drop: LatLng;
  onRoute: (r: DrivingRouteResult | null) => void;
}) {
  const loaded = useApiIsLoaded();
  const onRouteRef = useRef(onRoute);
  onRouteRef.current = onRoute;

  useEffect(() => {
    if (!loaded) return;
    let cancelled = false;
    onRouteRef.current(null);
    fetchGoogleDrivingRoute(pickup, drop).then((r) => {
      if (!cancelled) onRouteRef.current(r);
    });
    return () => {
      cancelled = true;
    };
  }, [loaded, pickup.lat, pickup.lng, drop.lat, drop.lng]);

  return null;
}

export type BookingRouteMapInnerProps = {
  pickup: LatLng;
  drop: LatLng;
  onPickupChange: (p: LatLng) => void;
  onDropChange: (p: LatLng) => void;
  placeMode: PlaceMode;
  routePath: LatLng[] | null;
  onRouteComputed: (r: DrivingRouteResult | null) => void;
  pickupLabel: string;
  dropLabel: string;
};

/**
 * Must be rendered inside `<APIProvider apiKey={...} libraries={['marker']}>`.
 * Driving route, polyline, draggable A/B pins, tap map to move active pin.
 */
export const BookingRouteMapInner: React.FC<BookingRouteMapInnerProps> = ({
  pickup,
  drop,
  onPickupChange,
  onDropChange,
  placeMode,
  routePath,
  onRouteComputed,
  pickupLabel,
  dropLabel,
}) => {
  const mid = {
    lat: (pickup.lat + drop.lat) / 2,
    lng: (pickup.lng + drop.lng) / 2,
  };

  const onMapClick = useCallback(
    (e: { detail: { latLng: google.maps.LatLngLiteral | null } }) => {
      const ll = e.detail?.latLng;
      if (!ll) return;
      if (placeMode === 'pickup') onPickupChange(ll);
      else onDropChange(ll);
    },
    [placeMode, onPickupChange, onDropChange]
  );

  const onPickupDrag = useCallback(
    (e: google.maps.MapMouseEvent) => {
      const ll = e.latLng?.toJSON?.();
      if (ll) onPickupChange(ll);
    },
    [onPickupChange]
  );

  const onDropDrag = useCallback(
    (e: google.maps.MapMouseEvent) => {
      const ll = e.latLng?.toJSON?.();
      if (ll) onDropChange(ll);
    },
    [onDropChange]
  );

  return (
    <>
      <RouteFromDirections pickup={pickup} drop={drop} onRoute={onRouteComputed} />
      <div className="rounded-2xl overflow-hidden border-2 border-[var(--saarthi-surface-high)] h-[min(52vh,440px)] min-h-[280px] w-full">
        <Map
          defaultCenter={mid}
          defaultZoom={8}
          gestureHandling="greedy"
          mapTypeControl
          fullscreenControl
          streetViewControl={false}
          style={{ width: '100%', height: '100%' }}
          onClick={onMapClick as (e: { detail: { latLng: google.maps.LatLngLiteral | null } }) => void}
        >
          <FitRouteBounds pickup={pickup} drop={drop} path={routePath} />
          {routePath && routePath.length > 1 ? (
            <Polyline
              path={routePath}
              strokeColor="#15803d"
              strokeOpacity={0.92}
              strokeWeight={5}
              geodesic
            />
          ) : null}
          <AdvancedMarker position={pickup} draggable title={pickupLabel} onDragEnd={onPickupDrag}>
            <Pin background="#166534" borderColor="#14532d" glyphColor="#ffffff" glyphText="A" />
          </AdvancedMarker>
          <AdvancedMarker position={drop} draggable title={dropLabel} onDragEnd={onDropDrag}>
            <Pin background="#c2410c" borderColor="#9a3412" glyphColor="#ffffff" glyphText="B" />
          </AdvancedMarker>
        </Map>
      </div>
    </>
  );
};
