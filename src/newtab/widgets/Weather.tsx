import { useEffect, useState, type ComponentType } from 'react';
import {
  RefreshCw,
  MapPin,
  Search,
  Sun,
  CloudSun,
  Cloud,
  Cloudy,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  type LucideProps,
} from 'lucide-react';
import type { WidgetContext } from './types';

interface WeatherConfig {
  lat?: number;
  lon?: number;
  name?: string;
  unit?: 'celsius' | 'fahrenheit';
}

interface WeatherData {
  current: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    relative_humidity_2m: number;
    time: string;
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
}

const CODE_MAP: Record<number, string> = {
  0: 'Clear',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  80: 'Showers',
  81: 'Heavy showers',
  82: 'Violent showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm + hail',
  99: 'Severe thunderstorm',
};

function describe(code: number): string {
  return CODE_MAP[code] ?? 'Unknown';
}

type IconEntry = { Icon: ComponentType<LucideProps>; variant: string };

const ICON_MAP: Record<number, IconEntry> = {
  0: { Icon: Sun, variant: 'sun' },
  1: { Icon: Sun, variant: 'sun' },
  2: { Icon: CloudSun, variant: 'partly' },
  3: { Icon: Cloudy, variant: 'cloud' },
  45: { Icon: CloudFog, variant: 'fog' },
  48: { Icon: CloudFog, variant: 'fog' },
  51: { Icon: CloudDrizzle, variant: 'rain' },
  53: { Icon: CloudDrizzle, variant: 'rain' },
  55: { Icon: CloudDrizzle, variant: 'rain' },
  61: { Icon: CloudRain, variant: 'rain' },
  63: { Icon: CloudRain, variant: 'rain' },
  65: { Icon: CloudRain, variant: 'rain' },
  71: { Icon: CloudSnow, variant: 'snow' },
  73: { Icon: CloudSnow, variant: 'snow' },
  75: { Icon: CloudSnow, variant: 'snow' },
  80: { Icon: CloudRain, variant: 'rain' },
  81: { Icon: CloudRain, variant: 'rain' },
  82: { Icon: CloudRain, variant: 'rain' },
  95: { Icon: CloudLightning, variant: 'storm' },
  96: { Icon: CloudLightning, variant: 'storm' },
  99: { Icon: CloudLightning, variant: 'storm' },
};

function iconFor(code: number): IconEntry {
  return ICON_MAP[code] ?? { Icon: Cloud, variant: 'cloud' };
}

async function geocode(
  q: string,
): Promise<{ lat: number; lon: number; name: string } | null> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`,
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

async function fetchWeather(
  lat: number,
  lon: number,
  unit: 'celsius' | 'fahrenheit',
): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
    `&forecast_days=4&timezone=auto` +
    `&temperature_unit=${unit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`weather ${res.status}`);
  return (await res.json()) as WeatherData;
}

export function WeatherWidget({
  config,
  onConfigChange,
}: WidgetContext<WeatherConfig>) {
  const unit = config.unit ?? 'celsius';
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    if (config.lat === undefined || config.lon === undefined) return;
    setLoading(true);
    setError(null);
    try {
      const w = await fetchWeather(config.lat, config.lon, unit);
      setData(w);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (config.lat !== undefined && config.lon !== undefined) load();
  }, [config.lat, config.lon, unit]);

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
      <div className="weather-setup">
        <form onSubmit={handleSearch} className="weather-search">
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

  const current = data ? iconFor(data.current.weather_code) : null;

  return (
    <div className="weather-widget">
      <div className="weather-head">
        <div className="weather-head-text">
          <div className="weather-loc">{config.name ?? 'Current'}</div>
          {data && current && (
            <div className="weather-desc">
              <current.Icon
                className={`weather-icon weather-icon--${current.variant}`}
                size={16}
                strokeWidth={2}
              />
              <span>{describe(data.current.weather_code)}</span>
            </div>
          )}
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={load}
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {loading && !data && <div className="muted">Loading…</div>}
      {data && (
        <>
          <div className="weather-temp">
            {Math.round(data.current.temperature_2m)}°
            <span className="unit">{unit === 'celsius' ? 'C' : 'F'}</span>
          </div>
          <div className="weather-meta">
            <span>Wind {Math.round(data.current.wind_speed_10m)} km/h</span>
            <span>Humidity {data.current.relative_humidity_2m}%</span>
          </div>
          {data.daily && (
            <div className="weather-forecast">
              {data.daily.time.slice(1, 4).map((date, i) => {
                const entry = iconFor(data.daily!.weather_code[i + 1]);
                return (
                  <div key={date} className="weather-day">
                    <span className="dow">
                      {new Date(date).toLocaleDateString([], {
                        weekday: 'short',
                      })}
                    </span>
                    <entry.Icon
                      className={`weather-icon weather-icon--${entry.variant}`}
                      size={14}
                      strokeWidth={2}
                    />
                    <span className="hi">
                      {Math.round(data.daily!.temperature_2m_max[i + 1])}°
                    </span>
                    <span className="lo">
                      {Math.round(data.daily!.temperature_2m_min[i + 1])}°
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function WeatherConfigPanel({
  config,
  onConfigChange,
}: WidgetContext<WeatherConfig>) {
  return (
    <div className="config-panel">
      <label className="config-row">
        <span>Unit</span>
        <select
          value={config.unit ?? 'celsius'}
          onChange={(e) =>
            onConfigChange({
              ...config,
              unit: e.target.value as 'celsius' | 'fahrenheit',
            })
          }
        >
          <option value="celsius">Celsius (°C)</option>
          <option value="fahrenheit">Fahrenheit (°F)</option>
        </select>
      </label>
      <button
        type="button"
        className="secondary-btn"
        onClick={() =>
          onConfigChange({
            lat: undefined,
            lon: undefined,
            name: undefined,
            unit: config.unit,
          })
        }
      >
        Change location
      </button>
    </div>
  );
}
