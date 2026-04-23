import React, { useEffect, useState } from 'react';
import { getWeather, type WeatherData } from '../../services/weatherService.ts';
import { getDistrictByName } from '../../config/mpLocations.ts';
import { useI18n } from '../../i18n/I18nContext.tsx';
import { Cloud, Droplets, Wind, Thermometer } from 'lucide-react';

type Props = { location?: string; compact?: boolean };

export const WeatherWidget: React.FC<Props> = ({ location = 'Indore', compact = false }) => {
  const [data, setData] = useState<WeatherData | null>(null);
  const { lang } = useI18n();
  const isHi = lang === 'hi';

  useEffect(() => {
    const district = getDistrictByName(location);
    const lat = district?.lat ?? 22.72;
    const lng = district?.lng ?? 75.86;
    getWeather(lat, lng, location).then(setData);
  }, [location]);

  if (!data) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-4 border border-blue-100 animate-pulse">
        <div className="h-20" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-blue-500 to-sky-600 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-100">{data.location}</p>
            <p className="text-3xl font-bold">{data.temp}°C</p>
            <p className="text-sm text-blue-100">{isHi ? data.descriptionHi : data.description}</p>
          </div>
          <div className="text-right text-sm space-y-1">
            <p className="flex items-center gap-1 justify-end">
              <Droplets className="w-3.5 h-3.5" /> {data.humidity}%
            </p>
            <p className="flex items-center gap-1 justify-end">
              <Wind className="w-3.5 h-3.5" /> {data.windSpeed} km/h
            </p>
            {data.rainfall > 0 && (
              <p className="text-yellow-200 font-bold">🌧️ {data.rainfall}mm</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Cloud className="w-5 h-5" />
        {isHi ? `🌤️ ${data.location} — मौसम` : `🌤️ ${data.location} — Weather`}
      </h3>

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-5xl font-extrabold">{data.temp}°C</p>
          <p className="text-blue-100 mt-1 text-lg">{isHi ? data.descriptionHi : data.description}</p>
        </div>
        <img
          src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
          alt={data.description}
          className="w-20 h-20"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/15 rounded-xl p-3 text-center">
          <Droplets className="w-5 h-5 mx-auto mb-1" />
          <p className="text-xl font-bold">{data.humidity}%</p>
          <p className="text-xs text-blue-100">{isHi ? 'नमी' : 'Humidity'}</p>
        </div>
        <div className="bg-white/15 rounded-xl p-3 text-center">
          <Wind className="w-5 h-5 mx-auto mb-1" />
          <p className="text-xl font-bold">{data.windSpeed}</p>
          <p className="text-xs text-blue-100">km/h</p>
        </div>
        <div className="bg-white/15 rounded-xl p-3 text-center">
          <Thermometer className="w-5 h-5 mx-auto mb-1" />
          <p className="text-xl font-bold">{data.rainfall}mm</p>
          <p className="text-xs text-blue-100">{isHi ? 'बारिश' : 'Rain'}</p>
        </div>
      </div>

      {data.rainfall > 0 && (
        <div className="mt-4 bg-yellow-400/20 rounded-xl p-3 border border-yellow-400/30">
          <p className="text-sm font-bold text-yellow-100">
            {isHi ? '⚠️ बारिश की संभावना — फसल ढकें' : '⚠️ Rain expected — cover your crops'}
          </p>
        </div>
      )}
    </div>
  );
};
