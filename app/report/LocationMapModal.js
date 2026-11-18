'use client';

import { useEffect, useRef, useState } from 'react';

async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return '';
    const data = await res.json();
    return data && data.display_name ? String(data.display_name) : '';
  } catch {
    return '';
  }
}

export default function LocationMapModal({ open, onClose, onConfirm, initialCoords }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const reqRef = useRef(0);
  const [leafletReady, setLeafletReady] = useState(false);
  const LRef = useRef(null);
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState('');
  const [addrLoading, setAddrLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const mod = await import('leaflet');
      if (cancelled) return;
      const L = mod.default || mod;
      if (!L.Icon.Default.prototype._iconUrlPatched) {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
        L.Icon.Default.prototype._iconUrlPatched = true;
      }
      LRef.current = L;
      setLeafletReady(true);
    })();
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setCoords(null);
      setAddress('');
      setAddrLoading(false);
      setGpsLoading(false);
      setGpsError('');
      setLeafletReady(false);
      LRef.current = null;
      reqRef.current += 1;
      if (markerRef.current) markerRef.current = null;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    }
  }, [open]);

  async function updateAddress(lat, lng) {
    const id = ++reqRef.current;
    setAddrLoading(true);
    const addr = await reverseGeocode(lat, lng);
    if (id !== reqRef.current) return;
    setAddress(addr);
    setAddrLoading(false);
  }

  function placeMarker(lat, lng, pan) {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    const pos = [lat, lng];
    setCoords({ lat, lng });
    if (markerRef.current) {
      markerRef.current.setLatLng(pos);
    } else {
      const marker = L.marker(pos, { draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const p = marker.getLatLng();
        placeMarker(p.lat, p.lng, false);
      });
      markerRef.current = marker;
    }
    if (pan) map.setView(pos, Math.max(map.getZoom(), 16));
    updateAddress(lat, lng);
  }

  useEffect(() => {
    if (!open || !leafletReady || !containerRef.current || mapRef.current || !LRef.current) return;
    const L = LRef.current;
    const map = L.map(containerRef.current, { zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    const startLat = initialCoords && Number.isFinite(initialCoords.lat) ? initialCoords.lat : null;
    const startLng = initialCoords && Number.isFinite(initialCoords.lng) ? initialCoords.lng : null;
    if (startLat != null && startLng != null) {
      map.setView([startLat, startLng], 16);
      placeMarker(startLat, startLng, false);
    } else {
      map.setView([20.5937, 78.9629], 5);
    }
    map.on('click', (e) => placeMarker(e.latlng.lat, e.latlng.lng, false));
    mapRef.current = map;
    setTimeout(() => { if (mapRef.current) mapRef.current.invalidateSize(); }, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, leafletReady]);

  function useCurrentLocation() {
    setGpsError('');
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser. Please select a location on the map.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        placeMarker(pos.coords.latitude, pos.coords.longitude, true);
      },
      (err) => {
        setGpsLoading(false);
        if (err && err.code === 1) setGpsError('Location permission was denied. Please allow location access or select a location on the map.');
        else if (err && err.code === 2) setGpsError('Your location is unavailable right now. Please try again or select a location on the map.');
        else if (err && err.code === 3) setGpsError('Location request timed out. Please try again or select a location on the map.');
        else setGpsError('Unable to detect your current location. Please select a location on the map.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  function confirm() {
    if (!coords) return;
    if (onConfirm) onConfirm({ latitude: coords.lat, longitude: coords.lng, address });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#11281f]/45 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="map-title" className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-[26px] bg-[#faf9f6] p-5 shadow-2xl sm:rounded-[26px] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[.15em] text-[#6e9873]">CHOOSE LOCATION</p>
            <h2 id="map-title" className="serif mt-1 text-2xl text-[#1b3c30]">Select issue location</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close map" className="grid h-9 w-9 place-items-center rounded-full bg-white text-xl text-[#66776b] hover:bg-[#eaf1e6]">&times;</button>
        </div>

        <div className="mt-4">
          <div className="overflow-hidden rounded-xl border border-[#dce4dc] bg-[#eef2e9]">
            <div ref={containerRef} style={{ height: 320, width: '100%' }} />
          </div>

          <div className="mt-4">
            <button type="button" onClick={useCurrentLocation} disabled={gpsLoading} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#285f43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4d35] disabled:cursor-wait disabled:opacity-65 sm:w-auto">
              {gpsLoading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Detecting current location…</> : 'Use My Current Location'}
            </button>
            {gpsError && <p role="alert" className="mt-2 rounded-xl border border-[#f0d1c8] bg-[#fff6f3] px-3 py-2 text-xs text-[#a54836]">{gpsError}</p>}
          </div>

          <div className="mt-4 rounded-xl border border-[#e7eae3] bg-white p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#879189]">Detected address</p>
            <p className="mt-1.5 min-h-[1.25rem] text-sm leading-6 text-[#334b41]">
              {addrLoading ? 'Detecting address…' : (address || (coords ? 'Address could not be detected. You can confirm the coordinates and enter a landmark manually.' : 'Tap the map or use your current location to place the marker.'))}
            </p>
          </div>

          <div className="mt-3 rounded-xl border border-[#e7eae3] bg-white p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#879189]">Latitude and Longitude</p>
            <p className="mt-1.5 font-mono text-sm text-[#334b41]">{coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : 'Not selected'}</p>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-full border border-[#dce4dc] bg-white px-5 py-3 text-sm font-semibold text-[#45614e] transition hover:bg-[#f1f5ed]">Cancel</button>
            <button type="button" onClick={confirm} disabled={!coords} className="rounded-full bg-[#285f43] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4d35] disabled:cursor-not-allowed disabled:opacity-50">Confirm Location</button>
          </div>
        </div>
      </section>
    </div>
  );
}
