import React from 'react';
import { UserRole } from '../types';
import { Users, X, Tractor, ShoppingBag, Truck, Warehouse, UserCircle } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

const PERSONA_OPTIONS: UserRole[] = [
  UserRole.FARMER,
  UserRole.BUYER,
  UserRole.LOGISTICS_PARTNER,
  UserRole.COLD_STORAGE_OWNER,
];

interface PersonaManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSwitch: (role: UserRole) => void;
}

export const PersonaManager: React.FC<PersonaManagerProps> = ({ isOpen, onClose, currentRole, onSwitch }) => {
  const { t } = useI18n();
  if (!isOpen) return null;

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.FARMER:
        return Tractor;
      case UserRole.BUYER:
        return ShoppingBag;
      case UserRole.LOGISTICS_PARTNER:
      case UserRole.TRANSPORTER:
        return Truck;
      case UserRole.COLD_STORAGE_OWNER:
        return Warehouse;
      default:
        return UserCircle;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users size={20} className="text-green-600" />
            {t('persona.title')}
          </h3>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-500 mb-2">{t('persona.hint')}</p>
          {PERSONA_OPTIONS.map((role) => {
            const Icon = getRoleIcon(role);
            const isActive = currentRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => {
                  onSwitch(role);
                  onClose();
                }}
                className={`w-full flex items-center p-3 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-gray-100 hover:border-green-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className={`p-2 rounded-full mr-3 ${isActive ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  <Icon size={20} />
                </div>
                <span className="font-semibold">{role}</span>
                {isActive && <div className="ml-auto text-xs font-bold bg-green-200 text-green-800 px-2 py-1 rounded-full">✓</div>}
              </button>
            );
          })}
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button type="button" onClick={onClose} className="text-sm font-medium text-gray-600 hover:text-gray-900">
            {t('persona.back')}
          </button>
        </div>
      </div>
    </div>
  );
};
