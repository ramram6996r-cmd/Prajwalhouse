import React, { useState } from 'react';
import { X, Cpu, Key, CheckCircle2, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';

interface GroqSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groqApiKey: string;
  onSaveGroqApiKey: (key: string, model: string) => void;
  groqModel: string;
  serverHasGroqKey: boolean;
}

export const GroqSettingsModal: React.FC<GroqSettingsModalProps> = ({
  isOpen,
  onClose,
  groqApiKey,
  onSaveGroqApiKey,
  groqModel,
  serverHasGroqKey,
}) => {
  const [inputKey, setInputKey] = useState(groqApiKey);
  const [selectedModel, setSelectedModel] = useState(groqModel || 'llama-3.3-70b-versatile');
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!inputKey.trim()) {
      setTestStatus('error');
      setTestMessage('Please paste a Groq API key (starts with gsk_...)');
      return;
    }
    setTesting(true);
    setTestStatus('idle');
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          Authorization: `Bearer ${inputKey.trim()}`
        }
      });
      if (res.ok) {
        setTestStatus('success');
        setTestMessage('Groq connection verified! Ultra-fast token generation active.');
      } else {
        const err = await res.json().catch(() => ({}));
        setTestStatus('error');
        setTestMessage(err.error?.message || 'Invalid Groq API Key or authentication failed');
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage(e.message || 'Network error communicating with Groq API');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSaveGroqApiKey(inputKey.trim(), selectedModel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-neutral-200 rounded-xl max-w-lg w-full p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 leading-tight">
              Groq AI Concierge Configuration
            </h3>
            <p className="text-xs text-neutral-500">
              Powers the real estate mediator between owner & user
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {serverHasGroqKey && !inputKey && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Server Environment Key Active:</strong> A default GROQ_API_KEY is pre-configured on the backend. You can still paste your custom key below to override it.
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Groq API Key (starts with gsk_...)
            </label>
            <div className="relative">
              <input
                type="password"
                value={inputKey}
                onChange={e => setInputKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 bg-neutral-50"
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500">
              <span>Your key is stored securely in your browser session & proxy.</span>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-amber-700 hover:underline flex items-center gap-0.5"
              >
                Get Groq Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Selected Groq Model
            </label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white"
            >
              <option value="llama-3.3-70b-versatile">
                LLaMA 3.3 70B Versatile (Recommended · Highest Reasoning)
              </option>
              <option value="llama-3.1-8b-instant">
                LLaMA 3.1 8B Instant (Ultra Low Latency)
              </option>
              <option value="mixtral-8x7b-32768">
                Mixtral 8x7B 32k (Extended Context Window)
              </option>
            </select>
          </div>

          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-600 space-y-1">
            <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>How the AI Middleman operates:</span>
            </div>
            <p>
              • The Groq agent speaks to tenants on behalf of the house owner.
            </p>
            <p>
              • It provides verified answers on rent, deposit, lock-in, pet rules, and society guidelines.
            </p>
            <p>
              • It strictly withholds owner phone and exact address until a ₹199 Visit Pass is unlocked.
            </p>
          </div>

          {testStatus === 'success' && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{testMessage}</span>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>{testMessage}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={testing || !inputKey.trim()}
            className="px-3.5 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors disabled:opacity-50"
          >
            {testing ? 'Verifying...' : 'Test Connection'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
