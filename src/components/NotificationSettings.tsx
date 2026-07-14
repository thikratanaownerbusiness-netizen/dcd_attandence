import { useState, FormEvent } from 'react';
import { NotificationSetting, ManagerNotification } from '../types';
import { 
  Bell, BellOff, Settings, AlertTriangle, Info, Clock, Check, Trash2, 
  Volume2, VolumeX, Sparkles, Send, Play
} from 'lucide-react';

interface NotificationSettingsProps {
  settings: NotificationSetting[];
  notifications: ManagerNotification[];
  onToggleSetting: (id: string) => void;
  onClearNotifications: () => void;
  onAddNotification: (notification: ManagerNotification) => void;
}

export default function NotificationSettings({ 
  settings, 
  notifications, 
  onToggleSetting, 
  onClearNotifications,
  onAddNotification 
}: NotificationSettingsProps) {
  
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules'>('alerts');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Custom alert simulator
  const [simMessage, setSimMessage] = useState('');
  const [simSeverity, setSimSeverity] = useState<'info' | 'warning' | 'alert'>('warning');

  const handleSimulateAlert = (e: FormEvent) => {
    e.preventDefault();
    if (!simMessage) return;

    const newAlert: ManagerNotification = {
      id: `M-${Date.now()}`,
      title: simSeverity === 'warning' ? 'វត្តមានសិក្ខាកាមយឺត' : simSeverity === 'alert' ? 'បញ្ហាប្រព័ន្ធវត្តមាន' : 'សេចក្ដីប្រកាស',
      message: simMessage,
      timestamp: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) + ' ' + new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      read: false,
      severity: simSeverity,
    };

    onAddNotification(newAlert);
    setSimMessage('');

    // Trigger subtle synthesize audio sound if sound is enabled
    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        if (simSeverity === 'alert') {
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
          gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.3);
        } else {
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(660, audioCtx.currentTime); // E5
          gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.15);
        }
      } catch (err) {
        console.log('Audio Context blocked or unsupported');
      }
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'alert':
        return 'border-red-100 bg-red-50 text-red-800';
      case 'warning':
        return 'border-amber-100 bg-amber-50 text-amber-800';
      case 'info':
      default:
        return 'border-blue-100 bg-blue-50 text-blue-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-amber-600 shrink-0" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-600 shrink-0" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Sidebar - Settings Rules */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Toggle Panel header */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Settings className="h-4.5 w-4.5 text-slate-500" />
              ការកំណត់ប្រព័ន្ធជូនដំណឹង
            </h4>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-lg border transition ${
                soundEnabled 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : 'bg-slate-50 text-slate-400 border-slate-100'
              }`}
              title={soundEnabled ? 'បិទសំឡេង' : 'បើកសំឡេង'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>

          {/* Rule Item Toggles */}
          <div className="space-y-3.5">
            {settings.map((rule) => (
              <div 
                key={rule.id} 
                className={`p-3.5 rounded-xl border text-xs transition flex items-start justify-between gap-3 ${
                  rule.enabled 
                    ? 'border-slate-200 bg-slate-50/50' 
                    : 'border-slate-100 bg-white opacity-60'
                }`}
              >
                <div className="space-y-1">
                  <span className="font-semibold text-slate-800 block leading-tight">
                    {rule.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    កាលវិភាគ: {rule.timeWindow}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleSetting(rule.id)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    rule.enabled ? 'bg-slate-800' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      rule.enabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Simulator - For Verification purposes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
            ប្រព័ន្ធសាកល្បងការជូនដំណឹង
          </h4>
          <p className="text-[11px] text-slate-400 leading-normal">
            ប្រើផ្ទាំងនេះ ដើម្បីធ្វើការសាកល្បងផ្ញើសារជូនដំណឹងភ្លាមៗ ទៅកាន់អ្នកគ្រប់គ្រង និងស្ដាប់សំឡេងរោទិ៍។
          </p>

          <form onSubmit={handleSimulateAlert} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">កម្រិតកំហុស</label>
              <div className="grid grid-cols-3 gap-2">
                {(['info', 'warning', 'alert'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSimSeverity(sev)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition border capitalize ${
                      simSeverity === sev
                        ? sev === 'alert' ? 'bg-red-50 text-red-700 border-red-200' : 
                          sev === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                          'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    {sev === 'alert' ? 'គ្រោះថ្នាក់' : sev === 'warning' ? 'ព្រមាន' : 'ព័ត៌មាន'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">សារជូនដំណឹង</label>
              <textarea
                required
                rows={2}
                placeholder="ឧ. ដល់ម៉ោងត្រួតពិនិត្យវត្តមានបញ្ចប់វេនព្រឹក..."
                value={simMessage}
                onChange={(e) => setSimMessage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border-0 rounded-xl text-xs focus:ring-2 focus:ring-slate-800 resize-none text-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Play className="h-3 w-3 shrink-0" />
              សាកល្បងរោទិ៍ និងផ្ញើ
            </button>
          </form>
        </div>
      </div>

      {/* Main Display - Notifications Inbox Logs */}
      <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[520px]">
        <div className="flex justify-between items-center border-b border-slate-50 pb-3 mb-4">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Bell className="h-4.5 w-4.5 text-emerald-600 animate-pulse" />
            ប្រអប់សំបុត្រការជូនដំណឹង ({notifications.length})
          </h4>
          
          {notifications.length > 0 && (
            <button
              onClick={onClearNotifications}
              className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              សម្អាតទាំងអស់
            </button>
          )}
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <BellOff className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-slate-500 font-medium text-sm">មិនទាន់មានការជូនដំណឹងនៅឡើយទេ</p>
              <p className="text-xs text-slate-400 mt-1">ប្រព័ន្ធដំណើរការបានយ៉ាងល្អប្រសើរ និងមានសុវត្ថិភាព</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border text-xs transition flex items-start gap-3.5 hover:shadow-sm duration-200 ${getSeverityStyle(
                  notif.severity
                )}`}
              >
                {getSeverityIcon(notif.severity)}
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-center gap-4">
                    <span className="font-bold text-slate-800 text-sm">
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    {notif.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
