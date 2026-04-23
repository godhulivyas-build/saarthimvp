import React, { useState } from 'react';
import { UserPreferences, PreferenceScreenProps } from '../types';
import { Button } from './ui/Button';
import { MapPin, ChevronDown } from 'lucide-react';
import { PersonaManager } from './PersonaManager';
import { ScreenChrome } from './layout/ScreenChrome';
import { useI18n } from '../i18n/I18nContext';

export const PreferenceScreen: React.FC<PreferenceScreenProps> = ({
  userRole,
  initialPreferences,
  onComplete,
  onSwitchPersona,
  onSkip,
  onBack,
}) => {
  const { t } = useI18n();
  const [formData, setFormData] = useState<UserPreferences>(
    initialPreferences || {
      location: '',
      primaryCrop: '',
      loadSize: '',
      urgency: 'Normal',
    }
  );
  const [showPersonaManager, setShowPersonaManager] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <ScreenChrome onBack={onBack} title={t('onboard.title')}>
      <div className="absolute top-[72px] right-4 z-10">
        <button
          type="button"
          onClick={() => setShowPersonaManager(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-xl text-xs font-bold border border-gray-200 min-h-[44px]"
        >
          {userRole.split(' ')[0]} <ChevronDown size={14} className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full flex flex-col p-4 pt-6">
        <p className="text-gray-600 text-base mb-6 leading-relaxed">{t('onboard.subtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">{t('onboard.location')}</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" size={22} />
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder={t('onboard.locationPh')}
                className="w-full min-h-[52px] pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-lg"
                autoComplete="address-level2"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button type="submit" fullWidth className="min-h-[52px] text-lg">
              {t('onboard.save')}
            </Button>
            <button
              type="button"
              onClick={onSkip}
              className="min-h-[48px] w-full rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-base bg-white"
            >
              {t('onboard.skip')}
            </button>
          </div>
        </form>
      </div>

      <PersonaManager
        isOpen={showPersonaManager}
        onClose={() => setShowPersonaManager(false)}
        currentRole={userRole}
        onSwitch={onSwitchPersona}
      />
    </ScreenChrome>
  );
};
