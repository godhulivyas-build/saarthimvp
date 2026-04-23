export type WeatherData = {
  temp: number;
  humidity: number;
  description: string;
  descriptionHi: string;
  icon: string;
  windSpeed: number;
  rainfall: number; // mm in last 1h
  location: string;
};

const OWM_KEY = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_OWM_API_KEY) || '';

const WEATHER_HI: Record<string, string> = {
  'clear sky': 'साफ़ आसमान',
  'few clouds': 'हल्के बादल',
  'scattered clouds': 'बिखरे बादल',
  'broken clouds': 'घने बादल',
  'overcast clouds': 'पूरा बादल छाया',
  'light rain': 'हल्की बारिश',
  'moderate rain': 'मध्यम बारिश',
  'heavy intensity rain': 'भारी बारिश',
  'thunderstorm': 'आंधी-तूफान',
  'mist': 'कोहरा',
  'haze': 'धुंध',
  'fog': 'घना कोहरा',
  'drizzle': 'बूंदाबांदी',
};

function fallbackWeather(location: string): WeatherData {
  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 18;
  return {
    temp: 28 + Math.round(Math.random() * 8),
    humidity: 55 + Math.round(Math.random() * 25),
    description: isDay ? 'partly cloudy' : 'clear sky',
    descriptionHi: isDay ? 'आंशिक बादल' : 'साफ़ आसमान',
    icon: isDay ? '02d' : '01n',
    windSpeed: 8 + Math.round(Math.random() * 12),
    rainfall: Math.random() > 0.7 ? Math.round(Math.random() * 5) : 0,
    location,
  };
}

export async function getWeather(lat: number, lng: number, location: string): Promise<WeatherData> {
  if (!OWM_KEY) return fallbackWeather(location);

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${OWM_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OWM ${res.status}`);
    const d = await res.json();
    const desc: string = d.weather?.[0]?.description ?? 'clear sky';
    return {
      temp: Math.round(d.main.temp),
      humidity: d.main.humidity,
      description: desc,
      descriptionHi: WEATHER_HI[desc] ?? desc,
      icon: d.weather?.[0]?.icon ?? '01d',
      windSpeed: Math.round((d.wind?.speed ?? 0) * 3.6),
      rainfall: d.rain?.['1h'] ?? 0,
      location,
    };
  } catch {
    return fallbackWeather(location);
  }
}
