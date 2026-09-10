import { useEffect, useState } from 'react';
import { X, Check, Sun, Moon, Laptop, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import { AppSettings, AVAILABLE_MODELS, ThemeMode } from '../types';
import { checkServerHealth, HealthResponse } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onClearAllData: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearAllData,
}: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'appearance' | 'chat' | 'model' | 'data'>('appearance');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (isOpen) {
      refreshHealth();
    }
  }, [isOpen]);

  const refreshHealth = async () => {
    setCheckingHealth(true);
    const res = await checkServerHealth();
    setHealth(res);
    setCheckingHealth(false);
  };

  if (!isOpen) return null;

  const handleSave = (updated: Partial<AppSettings>) => {
    const next = { ...localSettings, ...updated };
    setLocalSettings(next);
    onSaveSettings(next);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 id="settings-title" className="text-base font-semibold text-neutral-950 dark:text-white">
            Preferences & Settings
          </h2>
          <button
            onClick={onClose}
            title="Close"
            aria-label="Close"
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 px-5 gap-4 text-xs font-medium bg-neutral-50 dark:bg-neutral-950">
          {(['appearance', 'chat', 'model', 'data'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2.5 capitalize transition-colors border-b-2 -mb-px cursor-pointer ${
                activeTab === tab
                  ? 'border-neutral-900 dark:border-white text-neutral-950 dark:text-white font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Theme Mode
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(
                    [
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: Laptop },
                    ] as const
                  ).map((item) => {
                    const Icon = item.icon;
                    const isSelected = localSettings.theme === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSave({ theme: item.id as ThemeMode })}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition cursor-pointer ${
                          isSelected
                            ? 'border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs'
                            : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800/80">
                <div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    Enter to send
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    Pressing Enter submits the prompt; Shift + Enter inserts a newline.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.enterToSend}
                  onChange={(e) => handleSave({ enterToSend: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-neutral-900"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    Show timestamps
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    Display the time each message was sent or received.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.showTimestamps}
                  onChange={(e) => handleSave({ showTimestamps: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-neutral-900"
                />
              </div>
            </div>
          )}

          {/* Model Tab */}
          {activeTab === 'model' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Craig Intelligence Engine
                </label>
                <div className="space-y-2">
                  {AVAILABLE_MODELS.map((m) => {
                    const isSelected = localSettings.model === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => handleSave({ model: m.id })}
                        className={`p-3 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'border-neutral-900 dark:border-white bg-neutral-100/80 dark:bg-neutral-800/80'
                            : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                            {m.name}
                            {m.isDefault && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                                Default
                              </span>
                            )}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-neutral-900 dark:text-white" />}
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          {m.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Temperature */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Temperature ({localSettings.temperature})
                  </label>
                  <span className="text-[11px] text-neutral-400">
                    {localSettings.temperature <= 0.3 ? 'Focused & deterministic' : localSettings.temperature >= 0.8 ? 'Creative & exploratory' : 'Balanced'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.1"
                  value={localSettings.temperature}
                  onChange={(e) => handleSave({ temperature: parseFloat(e.target.value) })}
                  className="w-full accent-neutral-900 dark:accent-neutral-100"
                />
              </div>

              {/* Custom System Instruction */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  System Instructions
                </label>
                <textarea
                  rows={3}
                  value={localSettings.systemInstruction}
                  onChange={(e) => handleSave({ systemInstruction: e.target.value })}
                  placeholder="Set custom behavior or role guidelines..."
                  className="w-full p-2.5 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-neutral-400"
                />
              </div>
            </div>
          )}

          {/* Data & Connection Tab */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              {/* Server connection status */}
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    System Status & Health
                  </span>
                  <button
                    onClick={refreshHealth}
                    disabled={checkingHealth}
                    className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${checkingHealth ? 'animate-spin' : ''}`} />
                    <span>Check</span>
                  </button>
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Assistant Core:</span>
                    <span className="font-mono text-neutral-900 dark:text-neutral-200">
                      {health?.status === 'ok' ? 'Online' : 'Connecting...'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Privacy & Encryption:</span>
                    <span className="font-mono text-neutral-900 dark:text-neutral-200">
                      {health?.hasApiKey ? 'Secured (Server-side)' : 'Configuring'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Danger zone */}
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <div className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                  Clear All History
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                  This permanently wipes all saved conversation threads from this browser.
                </p>

                {confirmClear ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onClearAllData();
                        setConfirmClear(false);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black hover:opacity-90 transition cursor-pointer"
                    >
                      Yes, wipe all data
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Clear conversation history</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
