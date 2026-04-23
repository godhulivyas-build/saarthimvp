import React from 'react';
import { UserRole } from '../types';
import { Tractor, ShoppingBag, Truck, Warehouse } from 'lucide-react';

interface LoginScreenProps {
  onRoleSelect: (role: UserRole) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onRoleSelect }) => {
  const roles = [
    { id: UserRole.FARMER, icon: Tractor, color: "bg-green-100 text-green-700 border-green-200" },
    { id: UserRole.BUYER, icon: ShoppingBag, color: "bg-purple-100 text-purple-700 border-purple-200" },
    { id: UserRole.LOGISTICS_PARTNER, icon: Truck, color: "bg-orange-100 text-orange-700 border-orange-200" },
    { id: UserRole.COLD_STORAGE_OWNER, icon: Warehouse, color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-green-50 to-white">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600 mb-4 shadow-lg">
          <Truck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Saarthi</h1>
        <p className="text-gray-600">Your Agri-Logistics Companion</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wide mb-6">Select your Role</p>
        <div className="grid grid-cols-1 gap-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => onRoleSelect(role.id)}
              className={`flex items-center p-4 border-2 rounded-xl hover:shadow-md transition-all duration-200 ${role.color.replace('bg-', 'hover:bg-opacity-80 ')} border-transparent bg-white shadow-sm`}
            >
              <div className={`p-3 rounded-full mr-4 ${role.color}`}>
                <role.icon size={24} />
              </div>
              <span className="text-lg font-semibold text-gray-800">{role.id}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};