import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { getSupportAdvice } from '../../services/geminiService';
import { ChatMessage } from '../../types';
import { MessageSquare, Send, User, Bot, Mic } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

type SupportViewProps = {
  embedded?: boolean;
};

export const SupportView: React.FC<SupportViewProps> = ({ embedded }) => {
  const { lang, t } = useI18n();
  const defaultMsg =
    lang === 'hi'
      ? 'नमस्ते! मैं सारथी सहायक हूँ। मंडी भाव, कहाँ बेचें, या ढुलाई — पूछें।'
      : 'Hi! I am Saarthi. Ask about mandi prices, where to sell, or logistics.';
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: '1', role: 'model', text: defaultMsg }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ id: '1', role: 'model', text: defaultMsg }]);
  }, [defaultMsg]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const startVoice = () => {
    const W = window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown };
    const SR = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SR) {
      setInput((prev) => prev + (lang === 'hi' ? ' आपके फोन पर आवाज़ सपोर्ट नहीं है।' : ' Voice not supported on this device.'));
      return;
    }
    const rec = new SR() as {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      start: () => void;
      onresult: ((e: { results: Array<Array<{ transcript?: string }>> }) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
    };
    rec.lang = lang === 'hi' ? 'hi-IN' : lang === 'kn' ? 'kn-IN' : lang === 'te' ? 'te-IN' : 'en-IN';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (ev) => {
      const text = ev.results?.[0]?.[0]?.transcript;
      if (text) setInput(text);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const advice = await getSupportAdvice(userMsg.text, lang);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: advice,
    };

    setMessages((prev) => [...prev, botMsg]);
    setLoading(false);
  };

  const heightClass = embedded ? 'h-[58vh] min-h-[280px] max-h-[70vh]' : 'h-[calc(100vh-140px)] md:h-[600px]';

  return (
    <div
      className={`flex flex-col ${heightClass} bg-white ${embedded ? '' : 'rounded-xl shadow-sm border border-gray-200 overflow-hidden mx-4 my-2'}`}
    >
      {!embedded && (
        <div className="bg-green-600 p-4 text-white flex items-center gap-3 shadow-sm shrink-0">
          <div className="bg-white/20 p-2 rounded-full">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg">{t('support.title')}</h2>
            <p className="text-xs text-green-100">{t('support.subtitle')}</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}
              >
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                className={`p-3 rounded-2xl text-base leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-green-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-200 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[80%]">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-200">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:100ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:200ms]" />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex gap-2 shrink-0">
        <button
          type="button"
          onClick={startVoice}
          className={`min-h-[48px] min-w-[48px] rounded-xl border flex items-center justify-center ${
            listening ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-700'
          }`}
          aria-label="Voice"
        >
          <Mic size={22} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={lang === 'hi' ? 'यहाँ लिखें…' : 'Type here…'}
          className="flex-1 min-h-[48px] px-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-green-500 outline-none"
        />
        <Button type="submit" className="px-4 min-h-[48px]" disabled={loading || !input.trim()}>
          <Send size={20} />
        </Button>
      </form>
    </div>
  );
};
