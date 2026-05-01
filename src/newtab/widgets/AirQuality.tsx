import { useEffect, useState } from 'react';
import { RefreshCw, MapPin, Search } from 'lucide-react';
import type { WidgetContext } from './types';

interface AirQualityConfig {
  lat?: number;
  lon?: number;
  name?: string;
}

interface AQData {
  us_aqi: number | null;
  pm2_5: number | null;
  pm10: number | null;
  time: string;
}

interface Category {
  label: string;
  color: string;
}

const POLL_MS = 30 * 60 * 1000;

function aqiCategory(aqi: number | null): Category {
  if (aqi === null || Number.isNaN(aqi)) {
    return { label: '—', color: 'var(--fg-mute)' };
  }
  if (aqi <= 50) return { label: 'Good', color: '#22c55e' };
  if (aqi <= 100) return { label: 'Moderate', color: '#eab308' };
  if (aqi <= 150) return { label: 'Unhealthy for sensitive', color: '#f97316' };
  if (aqi <= 200) return { label: 'Unhealthy', color: '#ef4444' };
  if (aqi <= 300) return { label: 'Very unhealthy', color: '#a855f7' };
  return { label: 'Hazardous', color: '#7c2d12' };
}

async function geocode(
  q: string,
): Promise<{ lat: number; lon: number; name: string } | null> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      q,
    )}&count=1&language=en&format=json`,
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    results?: {
      latitude: number;
      longitude: number;
      name: string;
      country?: string;
      admin1?: string;
    }[];
  };
  const r = data.results?.[0];
  if (!r) return null;
  return {
    lat: r.latitude,
    lon: r.longitude,
    name: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
  };
}

async function fetchAQ(lat: number, lon: number): Promise<AQData> {
  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
    `&current=us_aqi,pm2_5,pm10&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`air-quality ${res.status}`);
  const json = (await res.json()) as {
    current?: {
      time: string;
      us_aqi?: number | null;
      pm2_5?: number | null;
      pm10?: number | null;
    };
  };
  return {
    us_aqi: json.current?.us_aqi ?? null,
    pm2_5: json.current?.pm2_5 ?? null,
    pm10: json.current?.pm10 ?? null,
    time: json.current?.time ?? '',
  };
}

export function AirQualityWidget({
  config,
  onConfigChange,
}: WidgetContext<AirQualityConfig>) {
  const [data, setData] = useState<AQData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    if (config.lat === undefined || config.lon === undefined) return;
    setLoading(true);
    setError(null);
    try {
      const d = await fetchAQ(config.lat, config.lon);
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (config.lat === undefined || config.lon === undefined) return;
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [config.lat, config.lon]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation unavailable');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onConfigChange({
          ...config,
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          name: 'My location',
        });
      },
      (err) => setError(err.message),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    setError(null);
    const hit = await geocode(search.trim());
    setLoading(false);
    if (!hit) {
      setError(`No city found for "${search}"`);
      return;
    }
    onConfigChange({ ...config, lat: hit.lat, lon: hit.lon, name: hit.name });
    setSearch('');
  };

  if (config.lat === undefined || config.lon === undefined) {
    return (
      <div className="aq-setup">
        <form onSubmit={handleSearch} className="aq-search">
          <Search size={14} />
          <input
            type="text"
            placeholder="City name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <button type="button" className="secondary-btn" onClick={useMyLocation}>
          <MapPin size={14} /> Use my location
        </button>
        {error && <div className="error">{error}</div>}
      </div>
    );
  }

  const aqi = data?.us_aqi ?? null;
  const cat = aqiCategory(aqi);
  const pctRaw = aqi === null ? 0 : Math.min(100, Math.max(0, (aqi / 500) * 100));

  return (
    <div className="aq-widget">
      <div className="aq-header">
        <span
          className="aq-dot"
          style={{ background: cat.color }}
          aria-hidden="true"
        />
        <span className="aq-loc" title={config.name ?? 'Current'}>
          {config.name ?? 'Current'}
        </span>
        <button
          type="button"
          className="icon-btn"
          onClick={load}
          disabled={loading}
          title="Refresh"
          aria-label="Refresh"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      <div className="aq-main">
        <span className="aq-value" style={{ color: cat.color }}>
          {aqi ?? '—'}
        </span>
        <span className="aq-cat" style={{ color: cat.color }}>
          {cat.label}
        </span>
      </div>

      <div className="aq-bar" role="img" aria-label={`AQI ${aqi ?? 'unknown'}`}>
        {aqi !== null && (
          <span
            className="aq-marker"
            style={{ left: `${pctRaw}%`, background: cat.color }}
          />
        )}
      </div>

      <div className="aq-foot">
        {error ? (
          <span className="error">{error}</span>
        ) : (
          <>
            <span>PM2.5 {data?.pm2_5 != null ? Math.round(data.pm2_5) : '—'}</span>
            <span className="aq-sep">·</span>
            <span>PM10 {data?.pm10 != null ? Math.round(data.pm10) : '—'}</span>
          </>
        )}
      </div>
    </div>
  );
}

export function AirQualityConfigPanel({
  onConfigChange,
}: WidgetContext<AirQualityConfig>) {
  return (
    <div className="config-panel">
      <button
        type="button"
        className="secondary-btn"
        onClick={() =>
          onConfigChange({
            lat: undefined,
            lon: undefined,
            name: undefined,
          })
        }
      >
        Change location
      </button>
      <p className="hint">
        Data from{' '}
        <a
          href="https://open-meteo.com/en/docs/air-quality-api"
          target="_blank"
          rel="noreferrer"
        >
          Open-Meteo
        </a>
        . US AQI scale (0–500).
      </p>
    </div>
  );
}
