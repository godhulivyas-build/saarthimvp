import React from 'react';
import { MessageCircle } from 'lucide-react';
import { CONTACT } from '../config/contact';

export const WhatsAppFloat: React.FC = () => {
  const href = `https://wa.me/${CONTACT.phoneE164}?text=${encodeURIComponent(CONTACT.whatsappPrefill)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-44 right-4 z-[78] min-h-[56px] min-w-[56px] rounded-full bg-[#25D366] text-white shadow-xl flex items-center justify-center border-2 border-white active:scale-95"
      aria-label="WhatsApp"
      title="WhatsApp"
    >
      <MessageCircle className="w-7 h-7" aria-hidden />
    </a>
  );
};
