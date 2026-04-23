import React from 'react';
import { Mic, Volume2, Loader2 } from 'lucide-react';
import { useVoiceAssistant } from '../voice/VoiceAssistantProvider';

export const VoiceMic: React.FC = () => {
  const { speaking, listening, processing, toggle } = useVoiceAssistant();

  return (
    <button
      type="button"
      onClick={toggle}
      className={`fixed bottom-24 right-4 z-[80] min-h-[64px] min-w-[64px] rounded-full shadow-xl flex items-center justify-center border-2 ${
        listening || speaking ? 'bg-red-600 text-white border-red-600' : 'bg-white text-green-700 border-green-200'
      }`}
      aria-label="Mic"
      title="Mic"
    >
      {processing ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : speaking ? (
        <Volume2 className="w-8 h-8" />
      ) : (
        <Mic className="w-8 h-8" />
      )}
    </button>
  );
};

