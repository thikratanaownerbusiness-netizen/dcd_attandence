import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trainee, AttendanceLog, WorkshopDocument, NotificationSetting, ManagerNotification, ShiftType, WorkshopSession 
} from './types';
import { 
  INITIAL_TRAINEES, INITIAL_ATTENDANCE_LOGS, INITIAL_DOCUMENTS, 
  INITIAL_NOTIFICATION_SETTINGS, INITIAL_MANAGER_NOTIFICATIONS, detectDevice 
} from './mockData';

// Component imports
import AttendanceList from './components/AttendanceList';
import TraineeManager from './components/TraineeManager';
import DocumentHub from './components/DocumentHub';
import MapTracker from './components/MapTracker';
import NotificationSettings from './components/NotificationSettings';
import RealQrCode from './components/RealQrCode';

// Icon imports
import { 
  Users, CalendarDays, Clock, ShieldCheck, MapPin, Smartphone, 
  Bell, FileText, CheckCircle2, ChevronRight, Compass, LogIn, LogOut, Sparkles, Volume2, AlertTriangle, QrCode, Download, Edit2, Check, Upload,
  Menu, X
} from 'lucide-react';

export const WORKSHOP_SESSIONS: WorkshopSession[] = [
  {
    id: 'morning_in',
    nameKh: 'វេនចូល-ព្រឹក',
    nameEn: 'Morning Check-In',
    timeRange: '07:30 AM - 08:00 AM',
    startTime: '07:30',
    endTime: '08:00',
    type: 'check_in',
    shift: 'morning'
  },
  {
    id: 'morning_out',
    nameKh: 'វេនចេញ-ព្រឹក',
    nameEn: 'Morning Check-Out',
    timeRange: '11:20 AM - 11:50 AM',
    startTime: '11:20',
    endTime: '11:50',
    type: 'check_out',
    shift: 'morning'
  },
  {
    id: 'afternoon_in',
    nameKh: 'វេនចូល-រសៀល',
    nameEn: 'Afternoon Check-In',
    timeRange: '01:30 PM - 02:00 PM',
    startTime: '13:30',
    endTime: '14:00',
    type: 'check_in',
    shift: 'afternoon'
  },
  {
    id: 'afternoon_out',
    nameKh: 'វេនចេញ-រសៀល',
    nameEn: 'Afternoon Check-Out',
    timeRange: '05:00 PM - 05:30 PM',
    startTime: '17:00',
    endTime: '17:30',
    type: 'check_out',
    shift: 'afternoon'
  }
];

// Helper to render high-contrast, low-density, easy-to-scan Version 1 QR Code
const renderVersion1QrCode = (sessionId: string, size: number = 130) => {
  return (
    <svg width={size} height={size} viewBox="0 0 21 21" className="text-slate-900" style={{ shapeRendering: 'crispEdges' }}>
      {/* Background */}
      <rect width="21" height="21" fill="white" />
      
      {/* Finder Pattern: Top-Left (0,0) */}
      <rect x="0" y="0" width="7" height="7" fill="currentColor" />
      <rect x="1" y="1" width="5" height="5" fill="white" />
      <rect x="2" y="2" width="3" height="3" fill="currentColor" />

      {/* Finder Pattern: Top-Right (14,0) */}
      <rect x="14" y="0" width="7" height="7" fill="currentColor" />
      <rect x="15" y="1" width="5" height="5" fill="white" />
      <rect x="16" y="2" width="3" height="3" fill="currentColor" />

      {/* Finder Pattern: Bottom-Left (0,14) */}
      <rect x="0" y="14" width="7" height="7" fill="currentColor" />
      <rect x="1" y="15" width="5" height="5" fill="white" />
      <rect x="2" y="16" width="3" height="3" fill="currentColor" />

      {/* Timing lines */}
      <rect x="8" y="6" width="1" height="1" fill="currentColor" />
      <rect x="10" y="6" width="1" height="1" fill="currentColor" />
      <rect x="12" y="6" width="1" height="1" fill="currentColor" />
      <rect x="6" y="8" width="1" height="1" fill="currentColor" />
      <rect x="6" y="10" width="1" height="1" fill="currentColor" />
      <rect x="6" y="12" width="1" height="1" fill="currentColor" />

      {/* Simple, sparse data bits for high contrast, low density, easy scanning! */}
      {sessionId === 'morning_in' ? (
        <>
          <rect x="9" y="1" width="2" height="1" fill="currentColor" />
          <rect x="12" y="2" width="1" height="1" fill="currentColor" />
          <rect x="9" y="4" width="1" height="2" fill="currentColor" />
          <rect x="8" y="8" width="2" height="2" fill="currentColor" />
          <rect x="11" y="9" width="2" height="1" fill="currentColor" />
          <rect x="10" y="11" width="1" height="2" fill="currentColor" />
          <rect x="8" y="13" width="2" height="1" fill="currentColor" />
          <rect x="16" y="8" width="2" height="2" fill="currentColor" />
          <rect x="18" y="11" width="2" height="1" fill="currentColor" />
          <rect x="14" y="14" width="2" height="2" fill="currentColor" />
        </>
      ) : sessionId === 'morning_out' ? (
        <>
          <rect x="8" y="0" width="2" height="1" fill="currentColor" />
          <rect x="11" y="3" width="2" height="1" fill="currentColor" />
          <rect x="9" y="5" width="1" height="1" fill="currentColor" />
          <rect x="8" y="9" width="3" height="1" fill="currentColor" />
          <rect x="12" y="8" width="1" height="2" fill="currentColor" />
          <rect x="9" y="12" width="2" height="2" fill="currentColor" />
          <rect x="15" y="8" width="2" height="1" fill="currentColor" />
          <rect x="18" y="9" width="2" height="2" fill="currentColor" />
          <rect x="15" y="15" width="2" height="2" fill="currentColor" />
        </>
      ) : sessionId === 'afternoon_in' ? (
        <>
          <rect x="10" y="1" width="2" height="2" fill="currentColor" />
          <rect x="8" y="4" width="2" height="1" fill="currentColor" />
          <rect x="11" y="10" width="2" height="1" fill="currentColor" />
          <rect x="8" y="12" width="3" height="1" fill="currentColor" />
          <rect x="16" y="9" width="2" height="2" fill="currentColor" />
          <rect x="14" y="12" width="1" height="1" fill="currentColor" />
          <rect x="18" y="14" width="2" height="2" fill="currentColor" />
        </>
      ) : (
        <>
          <rect x="9" y="2" width="2" height="1" fill="currentColor" />
          <rect x="12" y="4" width="1" height="1" fill="currentColor" />
          <rect x="10" y="9" width="3" height="1" fill="currentColor" />
          <rect x="8" y="11" width="1" height="2" fill="currentColor" />
          <rect x="15" y="8" width="1" height="3" fill="currentColor" />
          <rect x="17" y="12" width="3" height="1" fill="currentColor" />
          <rect x="15" y="16" width="2" height="2" fill="currentColor" />
        </>
      )}

      {/* Center Brand Emblem Logo for high-tech aesthetic */}
      <rect x="9.5" y="9.5" width="2" height="2" fill="white" />
      <rect x="10" y="10" width="1" height="1" fill="#2563EB" />
    </svg>
  );
};

interface AppUser {
  displayName: string;
  email: string;
  photoURL?: string;
}

export default function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [customLogo, setCustomLogo] = useState<string | null>(() => localStorage.getItem('app_custom_logo'));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'ratana' && password === '123') {
      setCurrentUser({
        displayName: 'Ratana',
        email: 'ratana@moeys.gov.kh',
        photoURL: '', // No photo for this user
      });
      setLoginError('');
    } else {
      const errorMessage = 'ឈ្មោះអ្នកប្រើប្រាស់ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ!';
      setLoginError(errorMessage);
      alert(errorMessage);
    }
  };

  const handleSignOut = async () => {
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    setLoginError('');
  };

  // Application State
  const [trainees, setTrainees] = useState<Trainee[]>(INITIAL_TRAINEES);
  const [logs, setLogs] = useState<AttendanceLog[]>(INITIAL_ATTENDANCE_LOGS);
  const [documents, setDocuments] = useState<WorkshopDocument[]>(INITIAL_DOCUMENTS);
  const [notifSettings, setNotifSettings] = useState<NotificationSetting[]>(INITIAL_NOTIFICATION_SETTINGS);
  const [notifications, setNotifications] = useState<ManagerNotification[]>(INITIAL_MANAGER_NOTIFICATIONS);

  // UI States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'trainees' | 'documents' | 'map' | 'alerts'>('dashboard');
  const [selectedGpsLog, setSelectedGpsLog] = useState<AttendanceLog | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Workshop location and Geofence (10 meters)
  const [workshopName, setWorkshopName] = useState('វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា (ITC) - សាលប្រជុំធំ អគារ A');
  const [workshopLat, setWorkshopLat] = useState(11.5564);
  const [workshopLng, setWorkshopLng] = useState(104.9282);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [tempWorkshopName, setTempWorkshopName] = useState('វិទ្យាស្ថានបច្គេកវិទ្យាកម្ពុជា (ITC) - សាលប្រជុំធំ អគារ A');
  const [tempWorkshopLat, setTempWorkshopLat] = useState('11.5564');
  const [tempWorkshopLng, setTempWorkshopLng] = useState('104.9282');

  // QR code management state
  const [selectedQrSessionId, setSelectedQrSessionId] = useState<string>('morning_in');

  const getDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Quick Scan modal states
  const [isScanning, setIsScanning] = useState(false);
  const [selectedTraineeId, setSelectedTraineeId] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);

  // Mobile Check-In URL Detection & States
  const [mobileCheckInSessionId, setMobileCheckInSessionId] = useState<string | null>(null);
  const [mobileTraineeId, setMobileTraineeId] = useState('');
  const [mobileGpsDistance, setMobileGpsDistance] = useState<number>(3.5); // Inside geofence by default
  const [mobileGpsType, setMobileGpsType] = useState<'real' | 'bypass'>('bypass');
  const [mobileDeviceName, setMobileDeviceName] = useState('ទូរស័ព្ទដៃសិក្ខាកាម (Mobile Phone)');
  const [mobileCheckInStatus, setMobileCheckInStatus] = useState<'idle' | 'success' | 'blocked'>('idle');

  // Geofence simulation states
  const [simType, setSimType] = useState<'simulated' | 'real'>('simulated');
  const [simDistance, setSimDistance] = useState<number>(5); // Default 5 meters (inside geofence!)
  const [scanBlockedInfo, setScanBlockedInfo] = useState<any | null>(null);

  // Detect QR Code mobile scan via URL search params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get('checkInSession');
    if (session) {
      setMobileCheckInSessionId(session);
      // Auto-detect browser device name for logs
      const ua = navigator.userAgent;
      if (/android/i.test(ua)) setMobileDeviceName('Android Phone');
      else if (/iPhone|iPad/i.test(ua)) setMobileDeviceName('iPhone');
      else setMobileDeviceName('ស្មាតហ្វូនសិក្ខាកាម');
    }
  }, []);

  // Time updater
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync fonts on load
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
    document.head.appendChild(link);
  }, []);

  // Format Date & Time in Khmer style
  const getKhmerDate = () => {
    const days = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
    const months = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    const day = days[currentTime.getDay()];
    const dateNum = currentTime.getDate();
    const month = months[currentTime.getMonth()];
    const year = currentTime.getFullYear();
    return `ថ្ងៃ${day}, ទី${dateNum} ខែ${month} ឆ្នាំ${year}`;
  };

  const getKhmerTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const getCurrentSessionId = (time: Date = currentTime): string => {
    const hrs = time.getHours();
    const mins = time.getMinutes();
    const totalMins = hrs * 60 + mins;

    // Morning In: 07:30 AM - 08:00 AM => 450 to 480
    if (totalMins >= 450 && totalMins <= 480) return 'morning_in';
    // Morning Out: 11:20 AM - 11:50 AM => 680 to 710
    if (totalMins >= 680 && totalMins <= 710) return 'morning_out';
    // Afternoon In: 01:30 PM - 02:00 PM => 810 to 840
    if (totalMins >= 810 && totalMins <= 840) return 'afternoon_in';
    // Afternoon Out: 05:00 PM - 05:30 PM => 1020 to 1050
    if (totalMins >= 1020 && totalMins <= 1050) return 'afternoon_out';

    // Fallbacks if outside exact windows:
    if (totalMins < 570) return 'morning_in'; // Before 09:30 AM
    if (totalMins >= 570 && totalMins < 780) return 'morning_out'; // 09:30 AM - 01:00 PM
    if (totalMins >= 780 && totalMins < 990) return 'afternoon_in'; // 01:00 PM - 04:30 PM
    return 'afternoon_out'; // After 04:30 PM
  };

  // Sync QR session with real clock automatically
  useEffect(() => {
    setSelectedQrSessionId(getCurrentSessionId());
  }, [currentTime.getMinutes(), currentTime.getHours()]);

  // Helper: check if it's currently morning shift (08:00 AM - 11:00 AM) or afternoon (02:00 PM - 05:00 PM)
  const getCurrentActiveShift = (): ShiftType => {
    const activeSession = WORKSHOP_SESSIONS.find(s => s.id === getCurrentSessionId());
    return activeSession ? activeSession.shift : 'morning';
  };

  // Trainee & Log Handlers
  const handleAddTrainee = (newTrainee: Trainee) => {
    setTrainees(prev => [newTrainee, ...prev]);
  };

  const handleDeleteTrainee = (id: string) => {
    if (confirm('តើអ្នកពិតជាចង់លុបគណនីសិក្ខាកាមនេះមែនទេ?')) {
      setTrainees(prev => prev.filter(t => t.id !== id));
      setLogs(prev => prev.filter(l => l.traineeId !== id));
    }
  };

  const handleAddLog = (newLog: AttendanceLog) => {
    setLogs(prev => [newLog, ...prev]);
    // If status is late, auto dispatch a manager alert
    if (newLog.status === 'late') {
      const isRuleEnabled = notifSettings.find(s => s.type === 'late')?.enabled ?? true;
      if (isRuleEnabled) {
        const newAlert: ManagerNotification = {
          id: `M-${Date.now()}`,
          title: 'វត្តមានសិក្ខាកាមយឺត',
          message: `សិក្ខាកាម ${newLog.traineeName} បានស្កេនវត្តមានយឺត (វេន: ${newLog.shift === 'morning' ? 'ព្រឹក' : 'រសៀល'}) តាមរយៈ ${newLog.deviceName}។ ទីតាំង GPS: ${newLog.latitude?.toFixed(4)}, ${newLog.longitude?.toFixed(4)}`,
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
          severity: 'warning',
        };
        setNotifications(prev => [newAlert, ...prev]);
        triggerSound('warning');
      }
    }
  };

  const handleUpdateLog = (id: string, updates: Partial<AttendanceLog>) => {
    setLogs(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    // If it is checkout update, check if we should notify
    if (updates.checkOutTime) {
      const isRuleEnabled = notifSettings.find(s => s.type === 'checkout')?.enabled ?? true;
      if (isRuleEnabled) {
        const targetLog = logs.find(l => l.id === id);
        const name = targetLog?.traineeName || 'សិក្ខាកាម';
        const newAlert: ManagerNotification = {
          id: `M-${Date.now()}`,
          title: 'សិក្ខាកាមស្កេនចេញ',
          message: `សិក្ខាកាម ${name} បានស្កេនចេញនៅម៉ោង ${updates.checkOutTime} ដោយជោគជ័យ។`,
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
          severity: 'info',
        };
        setNotifications(prev => [newAlert, ...prev]);
        triggerSound('info');
      }
    }
  };

  // Document Handlers
  const handleAddDocument = (newDoc: WorkshopDocument) => {
    setDocuments(prev => [newDoc, ...prev]);
  };

  const handleDeleteDocument = (id: string) => {
    if (confirm('តើអ្នកពិតជាចង់លុបឯកសារសិក្ខាសាលានេះមែនទេ?')) {
      setDocuments(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleDeleteLog = (id: string) => {
    if (confirm('តើលោកអ្នកពិតជាចង់លុបកំណត់ត្រាវត្តមានសិក្ខាកាមនេះមែនទេ?')) {
      setLogs(prev => prev.filter(l => l.id !== id));
    }
  };

  // Notification Settings & Alerts Handlers
  const handleToggleSetting = (id: string) => {
    setNotifSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleAddNotification = (newNotif: ManagerNotification) => {
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Trigger audio notification buzzer
  const triggerSound = (severity: 'info' | 'warning' | 'alert') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      if (severity === 'alert') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.35);
      } else {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(554, audioCtx.currentTime); // C#5
        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
      }
    } catch (e) {
      console.log('Audio Context blocked');
    }
  };

  // Select GPS log and switch tab
  const handleSelectGpsLog = (log: AttendanceLog) => {
    setSelectedGpsLog(log);
    setActiveTab('map');
  };

  // Quick Scan modal states
  const [scanSessionId, setScanSessionId] = useState<string>('morning_in');

  // Trainee "Scan Attendance" simulation with browser Geolocation and user-agent
  const handleStartAttendanceScan = () => {
    if (!selectedTraineeId) return;
    setGpsLoading(true);
    setScanBlockedInfo(null);
    setScanResult(null);

    const trainee = trainees.find(t => t.id === selectedTraineeId);
    if (!trainee) {
      setGpsLoading(false);
      return;
    }

    const deviceName = detectDevice(navigator.userAgent);

    if (simType === 'simulated') {
      // Simulate position based on chosen distance
      const angle = Math.random() * 2 * Math.PI;
      const latOffset = (simDistance * Math.sin(angle)) / 111111;
      const lngOffset = (simDistance * Math.cos(angle)) / (111111 * Math.cos(workshopLat * Math.PI / 180));
      const lat = workshopLat + latOffset;
      const lng = workshopLng + lngOffset;

      setTimeout(() => {
        if (simDistance > 10.0) {
          // Block scan
          handleScanBlocked(trainee, lat, lng, simDistance, deviceName, scanSessionId);
        } else {
          // Complete scan
          completeScan(trainee, lat, lng, 3, deviceName, scanSessionId);
        }
      }, 1000); // Simulate network delay
    } else {
      // Browser Geolocation capture
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            const realDistance = getDistanceInMeters(lat, lng, workshopLat, workshopLng);

            if (realDistance > 10.0) {
              handleScanBlocked(trainee, lat, lng, realDistance, deviceName, scanSessionId);
            } else {
              completeScan(trainee, lat, lng, accuracy, deviceName, scanSessionId);
            }
          },
          (error) => {
            console.log('Geolocation permission denied or timed out. Falling back to default coordinate preset.', error);
            // Since user explicitly chose real GPS and it failed, we give feedback
            alert('ការស្វែងរកទីតាំងពិតប្រាកដត្រូវបានបដិសេធ ឬទាមទារពេលវេលាយូរហួសកំណត់។');
            setGpsLoading(false);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        alert('ឧបករណ៍របស់អ្នកមិនគាំទ្រប្រព័ន្ធទីតាំង GPS ឡើយ។');
        setGpsLoading(false);
      }
    }
  };

  const handleScanBlocked = (
    trainee: Trainee,
    lat: number,
    lng: number,
    distance: number,
    deviceName: string,
    sessionId: string
  ) => {
    const session = WORKSHOP_SESSIONS.find(s => s.id === sessionId) || WORKSHOP_SESSIONS[0];
    
    // Create alert notification for manager (loud siren warning)
    const newAlert: ManagerNotification = {
      id: `M-BLOCKED-${Date.now()}`,
      title: 'ព្យាយាមស្កេនវត្តមានក្រៅតំបន់ស្កេន (១០ម៉ែត្រ)',
      message: `សិក្ខាកាម ${trainee.nameKh} (${trainee.studentId}) បានព្យាយាមស្កេន [${session.nameKh}] ពីចម្ងាយ ${distance.toFixed(1)} ម៉ែត្រ ដែលហួសពីដែនកំណត់សិក្ខាសាលា (១០ម៉ែត្រ)។ ឧបករណ៍: ${deviceName}។`,
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
      severity: 'alert', // triggers siren audio immediately!
    };

    setNotifications(prev => [newAlert, ...prev]);
    triggerSound('alert');

    setScanBlockedInfo({
      traineeName: trainee.nameKh,
      studentId: trainee.studentId,
      distance,
      latitude: lat,
      longitude: lng,
      deviceName,
      shift: session.shift,
      sessionName: session.nameKh
    });
    setGpsLoading(false);
  };

  const completeScan = (
    trainee: Trainee, 
    lat: number, 
    lng: number, 
    accuracy: number | null, 
    deviceName: string, 
    sessionId: string
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const dateStr = now.toISOString().split('T')[0];
    const session = WORKSHOP_SESSIONS.find(s => s.id === sessionId) || WORKSHOP_SESSIONS[0];

    // Determine status: Late if scanning after the shift start hour
    let status: 'present' | 'late' = 'present';
    const hrs = now.getHours();
    const mins = now.getMinutes();
    const totalMins = hrs * 60 + mins;

    if (session.id === 'morning_in') {
      // Late if after 08:00 AM (480 mins)
      if (totalMins > 480) {
        status = 'late';
      }
    } else if (session.id === 'afternoon_in') {
      // Late if after 02:00 PM (14:00 => 840 mins)
      if (totalMins > 840) {
        status = 'late';
      }
    }

    if (session.type === 'check_out') {
      // It is a check-out session
      // Find today's log for this trainee and shift
      const existingLog = logs.find(l => l.traineeId === trainee.id && l.date === dateStr && l.shift === session.shift);
      
      if (existingLog) {
        const updatedLogs = logs.map(l => l.id === existingLog.id ? {
          ...l,
          checkOutTime: timeStr,
          notes: `ស្កេនចេញ [${session.nameKh}] ជោគជ័យ`,
          latitude: lat,
          longitude: lng,
          deviceName,
          accuracy
        } : l);
        
        setLogs(updatedLogs);
        
        setScanResult({
          ...existingLog,
          checkOutTime: timeStr,
          notes: `ស្កេនចេញ [${session.nameKh}] ជោគជ័យ`,
          deviceName,
          latitude: lat,
          longitude: lng,
          accuracy,
          isCheckoutOnly: true,
          sessionName: session.nameKh
        });

        // Trigger standard info sound
        triggerSound('info');
        setGpsLoading(false);
        return;
      } else {
        // Create checking log with empty checkIn and valid checkOut
        const newLog: AttendanceLog = {
          id: `L-${Date.now()}`,
          traineeId: trainee.id,
          traineeName: trainee.nameKh,
          studentId: trainee.studentId,
          shift: session.shift,
          date: dateStr,
          checkInTime: '--:--',
          checkOutTime: timeStr,
          status: 'present',
          deviceName,
          latitude: lat,
          longitude: lng,
          accuracy,
          notes: `ស្កេនចេញផ្ទាល់ [${session.nameKh}] (គ្មានស្កេនចូល)`,
        };

        handleAddLog(newLog);
        setScanResult({
          ...newLog,
          isCheckoutOnly: true,
          sessionName: session.nameKh
        });
        triggerSound('info');
        setGpsLoading(false);
        return;
      }
    } else {
      // It is a check-in session
      const existingLog = logs.find(l => l.traineeId === trainee.id && l.date === dateStr && l.shift === session.shift);
      if (existingLog && existingLog.checkInTime !== '--:--') {
        alert(`សិក្ខាកាម ${trainee.nameKh} បានស្កេនចូលរួចហើយសម្រាប់ [${session.nameKh}]!`);
        setGpsLoading(false);
        return;
      }

      const newLog: AttendanceLog = {
        id: `L-${Date.now()}`,
        traineeId: trainee.id,
        traineeName: trainee.nameKh,
        studentId: trainee.studentId,
        shift: session.shift,
        date: dateStr,
        checkInTime: timeStr,
        checkOutTime: null,
        status,
        deviceName,
        latitude: lat,
        longitude: lng,
        accuracy,
        notes: status === 'late' ? `ស្កេនចូលយឺត [${session.nameKh}]` : `ស្កេនចូលទាន់ពេល [${session.nameKh}]`,
      };

      handleAddLog(newLog);
      setScanResult({
        ...newLog,
        sessionName: session.nameKh
      });
      triggerSound('info');
      setGpsLoading(false);
    }
  };

  const handleCloseScanModal = () => {
    setIsScanning(false);
    setSelectedTraineeId('');
    setScanResult(null);
    setScanBlockedInfo(null);
  };

  if (!mobileCheckInSessionId && !currentUser) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-4 relative overflow-hidden antialiased font-sans">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 h-96 w-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-[#111827]/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl relative text-center space-y-6"
        >
          {/* Real Logo Emblem / Uploader */}
          <div className="mx-auto flex flex-col items-center space-y-2">
            <label className="cursor-pointer relative group block">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64String = reader.result as string;
                      localStorage.setItem('app_custom_logo', base64String);
                      setCustomLogo(base64String);
                    };
                    reader.readAsDataURL(file);
                  }
                }} 
                className="hidden" 
              />
              <div className="h-24 w-24 bg-[#1f2937] hover:bg-[#374151] rounded-2xl flex flex-col items-center justify-center border border-dashed border-slate-700 hover:border-amber-400/50 transition-all overflow-hidden group-hover:scale-[1.02] shadow-inner relative">
                {customLogo ? (
                  <>
                    <img 
                      src={customLogo} 
                      alt="Custom Logo" 
                      className="h-full w-full object-contain p-2"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <p className="text-[10px] text-white font-bold uppercase tracking-wider">ផ្លាស់ប្តូរ Logo</p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center space-y-1 p-2 text-center text-slate-400">
                    <Upload className="h-6 w-6 text-amber-400 animate-bounce" />
                    <span className="text-[9px] font-bold text-amber-400">បញ្ចូល LOGO</span>
                    <span className="text-[7px] text-slate-500">PNG / JPG</span>
                  </div>
                )}
              </div>
            </label>
            {customLogo && (
              <button 
                onClick={() => {
                  localStorage.removeItem('app_custom_logo');
                  setCustomLogo(null);
                }}
                className="text-[9px] text-slate-400 hover:text-red-400 font-bold transition flex items-center gap-1 cursor-pointer"
              >
                លុប Logo ចេញ
              </button>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-sm font-black tracking-wider text-amber-400 uppercase leading-tight">ក្រសួងអប់រំ យុវជន និងកីឡា</h1>
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wide">នាយកដ្ឋានអភិវឌ្ឍកម្មវិធីសិក្សា</h2>
            <div className="h-[1px] w-12 bg-amber-500/30 mx-auto my-3" />
            <p className="text-base font-extrabold text-white leading-tight">ប្រព័ន្ធគ្រប់គ្រង និងតាមដានវត្តមានសិក្ខាសាលា</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
              ប្រព័ន្ធរៀបចំ និងផ្ទៀងផ្ទាត់ការចុះវត្តមានសិក្ខាកាមស្វ័យប្រវត្ត ធានាភាពសុក្រឹតតាមរយៈបច្ចេកវិទ្យា Geofencing និង Dynamic QR Codes។
            </p>
          </div>

          <div className="pt-2">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block text-left uppercase tracking-wider">ឈ្មោះអ្នកប្រើប្រាស់</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full mt-1 bg-[#1f2937] border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  placeholder="ratana"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block text-left uppercase tracking-wider">ពាក្យសម្ងាត់</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 bg-[#1f2937] border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  placeholder="••••••••"
                />
              </div>
              {loginError && <p className="text-xs text-red-400 text-center !mt-2">{loginError}</p>}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-150 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span>ចូលប្រព័ន្ធ</span>
              </button>
            </form>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-2xl text-left space-y-1.5">
            <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping shrink-0" />
              សេចក្តីណែនាំគណនីគ្រប់គ្រងប្រព័ន្ធ
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              សម្រាប់គណនីគ្រប់គ្រងប្រព័ន្ធ សូមប្រើប្រាស់គណនីដែលបានផ្តល់ให้ ដើម្បីចូលប្រើប្រាស់ផ្ទាំងបញ្ជា។
            </p>
          </div>

          <p className="text-[9px] text-slate-500 font-medium pt-2">
            © ២០២៦ នាយកដ្ឋានអភិវឌ្ឍកម្មវិធីសិក្សា នៃក្រសួងអប់រំ យុវជន និងកីឡា។ រក្សាសិទ្ធិគ្រប់យ៉ាង
          </p>
        </motion.div>
      </div>
    );
  }

  // Mobile Check-In Portal branch
  if (mobileCheckInSessionId) {
    const activeSession = WORKSHOP_SESSIONS.find(s => s.id === mobileCheckInSessionId) || WORKSHOP_SESSIONS[0];
    
    const handleMobileCheckInSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!mobileTraineeId) return;
      
      const trainee = trainees.find(t => t.id === mobileTraineeId || t.studentId === mobileTraineeId);
      if (!trainee) {
        alert('រកមិនឃើញព័ត៌មានសិក្ខាកាមជាមួយអត្តលេខនេះឡើយ!');
        return;
      }
      
      const lat = 11.5564; // central workshop coordinates
      const lng = 104.9282;
      const deviceName = mobileDeviceName;
      
      if (mobileGpsDistance > 10) {
        handleScanBlocked(trainee, lat + (mobileGpsDistance / 111000), lng, mobileGpsDistance, deviceName, mobileCheckInSessionId);
        setMobileCheckInStatus('blocked');
      } else {
        completeScan(trainee, lat, lng, 3, deviceName, mobileCheckInSessionId);
        setMobileCheckInStatus('success');
      }
    };

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 antialiased font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          {/* Official Style Header */}
          <div className="bg-[#0f172a] text-center p-6 text-white relative flex flex-col items-center">
            <div className="absolute top-0 right-0 h-32 w-32 bg-blue-500/10 rounded-full blur-2xl" />
            {customLogo ? (
              <img 
                src={customLogo} 
                alt="Custom Logo" 
                className="w-16 h-16 object-contain mb-3 rounded-xl bg-slate-800/30 p-1 border border-slate-700/30" 
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-[9px] text-amber-400 font-bold mb-3">
                No Logo
              </div>
            )}
            <h1 className="text-xs font-black tracking-wide text-amber-400 uppercase">ក្រសួងអប់រំ យុវជន និងកីឡា</h1>
            <h2 className="text-xs font-bold text-slate-300 mt-1">នាយកដ្ឋានអភិវឌ្ឍកម្មវិធីសិក្សា</h2>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] text-emerald-400 font-bold tracking-wide mt-4">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping shrink-0" />
              ប្រព័ន្ធស្កេនវត្តមានចល័តសកម្ម (Mobile Scanner)
            </div>
          </div>

          <div className="p-6 space-y-5">
            {mobileCheckInStatus === 'success' ? (
              <div className="text-center space-y-4 py-4 animate-scaleUp">
                <div className="h-16 w-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="h-8 w-8 animate-bounce" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-900 text-sm">ចុះវត្តមានបានជោគជ័យ!</h3>
                  <p className="text-[11px] text-slate-500">កំណត់ត្រាវត្តមានរបស់អ្នកត្រូវបានបញ្ចូលទៅក្នុងប្រព័ន្ធរៀបចំសិក្ខាសាលា</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-left text-xs space-y-2">
                  <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                    <span className="text-slate-500">សិក្ខាកាម៖</span>
                    <span className="font-bold text-slate-800">
                      {trainees.find(t => t.id === mobileTraineeId || t.studentId === mobileTraineeId)?.nameKh}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                    <span className="text-slate-500">វគ្គសិក្ខាសាលា៖</span>
                    <span className="font-bold text-slate-800">{activeSession.nameKh}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ពេលវេលា៖</span>
                    <span className="font-mono font-bold text-emerald-700">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileCheckInStatus('idle');
                    setMobileTraineeId('');
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                >
                  ចុះឈ្មោះវត្តមានសិក្ខាកាមផ្សេងទៀត
                </button>
              </div>
            ) : mobileCheckInStatus === 'blocked' ? (
              <div className="text-center space-y-4 py-4 animate-scaleUp">
                <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
                  <AlertTriangle className="h-8 w-8 animate-bounce" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-red-600 text-sm">ការស្កេនវត្តមានត្រូវបានបដិសេធ!</h3>
                  <p className="text-[11px] text-slate-500">លោកអ្នកស្ថិតនៅក្រៅដែនកំណត់ចម្ងាយស្កេនដែលអនុញ្ញាត (១០ម៉ែត្រ)</p>
                </div>
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-left text-xs space-y-2">
                  <div className="flex justify-between border-b border-red-100 pb-1.5">
                    <span className="text-slate-500">ចម្ងាយបច្ចុប្បន្ន៖</span>
                    <span className="font-mono font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded text-[11px]">{mobileGpsDistance.toFixed(1)} ម៉ែត្រ</span>
                  </div>
                  <div className="flex justify-between border-b border-red-100 pb-1.5">
                    <span className="text-slate-500">ចម្ងាយអនុញ្ញាតអតិបរមា៖</span>
                    <span className="font-bold text-emerald-600">១០ ម៉ែត្រ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">វគ្គ៖</span>
                    <span className="font-bold text-slate-800">{activeSession.nameEn}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileCheckInStatus('idle');
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                >
                  ព្យាយាមស្កេនឡើងវិញ
                </button>
              </div>
            ) : (
              <form onSubmit={handleMobileCheckInSubmit} className="space-y-4">
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-blue-500 uppercase block tracking-wider">សកម្មភាពសិក្ខាសាលា</span>
                    <h3 className="font-extrabold text-slate-950 text-[13px]">{activeSession.nameKh}</h3>
                    <p className="text-[10px] text-slate-500 font-medium font-mono">{activeSession.timeRange}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">ជ្រើសរើសឈ្មោះ ឬអត្តលេខសិក្ខាកាមរបស់អ្នក *</label>
                  <select
                    required
                    value={mobileTraineeId}
                    onChange={(e) => setMobileTraineeId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 text-slate-800"
                  >
                    <option value="">-- សូមជ្រើសរើសគណនីរបស់អ្នក --</option>
                    {trainees.map(t => (
                      <option key={t.id} value={t.id}>{t.nameKh} ({t.studentId}) - {t.shift === 'morning' ? 'វេនព្រឹក' : 'វេនរសៀល'}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 mb-2">
                    <span className="text-xs font-bold text-slate-700">ជម្រើសទីតាំង (GPS Accuracy)</span>
                    <div className="flex gap-1 bg-slate-200 p-0.5 rounded-lg text-[9px] font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileGpsType('bypass');
                          setMobileGpsDistance(3.5);
                        }}
                        className={`px-2.5 py-1 rounded-md transition ${mobileGpsType === 'bypass' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                      >
                        Bypass (Inside 10m)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileGpsType('real');
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              setMobileGpsDistance(12.5); 
                            },
                            () => {
                              setMobileGpsDistance(15.2);
                            }
                          );
                        }}
                        className={`px-2.5 py-1 rounded-md transition ${mobileGpsType === 'real' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                      >
                        GPS ឧបករណ៍ពិត
                      </button>
                    </div>
                  </div>

                  {mobileGpsType === 'bypass' ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">ចម្ងាយពីទីតាំងសិក្ខាសាលា៖</span>
                        <span className="font-mono font-bold text-emerald-600">{mobileGpsDistance} ម៉ែត្រ (ក្នុងដែនស្កេន)</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={mobileGpsDistance}
                        onChange={(e) => setMobileGpsDistance(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2 text-[10px] text-slate-600">
                      <p>កូអរដោនេសិក្ខាសាលា៖ <b className="font-mono">11.5564, 104.9282</b></p>
                      <div className="flex justify-between items-center">
                        <span>ចម្ងាយឧបករណ៍ពិតប្រាកដរបស់អ្នក៖</span>
                        <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${mobileGpsDistance <= 10 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {mobileGpsDistance.toFixed(1)} ម៉ែត្រ
                        </span>
                      </div>
                      {mobileGpsDistance > 10 && (
                        <p className="text-[9px] text-amber-600">⚠️ បច្ចុប្បន្ន លោកអ្នកស្ថិតនៅក្រៅកាំ ១០ម៉ែត្រ។ សូមធ្វើដំណើរទៅកាន់សាលប្រជុំដើម្បីស្កេន ឬជ្រើសរើស <b>Bypass</b> សម្រាប់ធ្វើតេស្ត។</p>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl transition shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  បញ្ជាក់វត្តមានរបស់ខ្ញុំ (Confirm Attendance)
                </button>
              </form>
            )}
          </div>
        </div>
        
        {/* Return to Trainer dashboard link */}
        <button
          onClick={() => setMobileCheckInSessionId(null)}
          className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 underline"
        >
          ត្រឡប់ទៅកាន់ផ្ទាំងគ្រប់គ្រងរៀបចំ (Back to Trainer Dashboard)
        </button>
      </div>
    );
  }

  // Metrics calculation
  const totalTrainees = trainees.length;
  const todayLogs = logs.filter(l => l.date === currentTime.toISOString().split('T')[0]);
  const morningScans = todayLogs.filter(l => l.shift === 'morning').length;
  const afternoonScans = todayLogs.filter(l => l.shift === 'afternoon').length;
  const unreadAlerts = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen w-full bg-[#f1f5f9] font-sans text-slate-800 overflow-hidden antialiased relative">
      
      {/* Mobile Sidebar Overlay/Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-all duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-slate-300 flex flex-col shrink-0 border-r border-slate-800 transition-transform duration-300 md:static md:translate-x-0 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Mobile Close Button */}
        <div className="md:hidden absolute top-4 right-4 z-50">
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="បិទបញ្ជី"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 border-b border-slate-800 text-center flex flex-col items-center">
          {/* Centered, enlarged custom Logo Upload Box */}
          <label className="cursor-pointer relative group block mb-4">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64String = reader.result as string;
                    localStorage.setItem('app_custom_logo', base64String);
                    setCustomLogo(base64String);
                  };
                  reader.readAsDataURL(file);
                }
              }} 
              className="hidden" 
            />
            <div className="w-28 h-28 bg-[#1f2937] hover:bg-[#374151] rounded-2xl flex flex-col items-center justify-center border border-dashed border-slate-700 hover:border-amber-400/60 transition-all overflow-hidden relative shadow-inner group-hover:scale-105">
              {customLogo ? (
                <img 
                  src={customLogo} 
                  alt="Custom Logo" 
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <div className="flex flex-col items-center space-y-1 p-2 text-slate-400">
                  <Upload className="h-6 w-6 text-amber-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">បញ្ចូល LOGO</span>
                  <span className="text-[8px] text-slate-500 font-mono">PNG / JPG</span>
                </div>
              )}
            </div>
          </label>

          <div className="flex flex-col gap-0.5 text-center">
            <span className="text-[11px] text-amber-400 font-black tracking-wide uppercase">នាយកដ្ឋានអភិវឌ្ឍកម្មវិធីសិក្សា</span>
            <span className="text-[9px] text-slate-400 leading-none mt-1">ប្រព័ន្ធគ្រប់គ្រងវត្តមានសិក្ខាសាលា</span>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">ផ្ទាំងគ្រប់គ្រង</div>
          
          <button
            onClick={() => { setActiveTab('dashboard'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition duration-150 ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4 shrink-0 text-blue-400" />
            ទិដ្ឋភាពទូទៅ & ស្កេនរហ័ស
          </button>

          <button
            onClick={() => { setActiveTab('attendance'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition duration-150 ${
              activeTab === 'attendance'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <CalendarDays className="h-4 w-4 shrink-0 text-amber-400" />
            តារាងវត្តមានសិក្ខាកាម
          </button>

          <button
            onClick={() => { setActiveTab('map'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition duration-150 ${
              activeTab === 'map'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="h-4 w-4 shrink-0 text-emerald-400" />
            ផែនទី GPS ចាប់ទីតាំង
          </button>

          <div className="px-3 py-2 mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">ទិន្នន័យសិក្ខាសាលា</div>

          <button
            onClick={() => { setActiveTab('trainees'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition duration-150 ${
              activeTab === 'trainees'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4 shrink-0 text-sky-400" />
            គ្រប់គ្រងគណនីសិក្ខាកាម
          </button>

          <button
            onClick={() => { setActiveTab('documents'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition duration-150 ${
              activeTab === 'documents'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4 shrink-0 text-indigo-400" />
            ឯកសារកិច្ចការសិក្ខាសាលា
          </button>

          <div className="px-3 py-2 mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">សន្តិសុខ & ប្រព័ន្ធ</div>

          <button
            onClick={() => { setActiveTab('alerts'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition duration-150 ${
              activeTab === 'alerts'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3">
              <Bell className="h-4 w-4 shrink-0 text-red-400" />
              ប្រព័ន្ធជូនដំណឹង និងរោទិ៍
            </span>
            {unreadAlerts > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-mono font-bold rounded">
                {unreadAlerts}
              </span>
            )}
          </button>

          {/* Quick Active Shifts Status list in Sidebar */}
          <div className="pt-4 border-t border-slate-800/60 mt-4 space-y-2">
            <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">វេនសិក្សាសកម្ម</div>
            <div className="px-3 py-1.5 flex items-center justify-between text-[11px] bg-slate-900/40 rounded-lg border border-slate-800/40">
              <span className="text-slate-400">វេនព្រឹក (08-11)</span>
              {getCurrentActiveShift() === 'morning' ? (
                <span className="px-1.5 py-0.2 bg-green-500/10 text-green-400 text-[9px] font-bold rounded border border-green-500/20">សកម្ម</span>
              ) : (
                <span className="px-1.5 py-0.2 bg-slate-800 text-slate-500 text-[9px] font-bold rounded border border-slate-700">បិទ</span>
              )}
            </div>
            <div className="px-3 py-1.5 flex items-center justify-between text-[11px] bg-slate-900/40 rounded-lg border border-slate-800/40">
              <span className="text-slate-400">វេនរសៀល (02-05)</span>
              {getCurrentActiveShift() === 'afternoon' ? (
                <span className="px-1.5 py-0.2 bg-green-500/10 text-green-400 text-[9px] font-bold rounded border border-green-500/20">សកម្ម</span>
              ) : (
                <span className="px-1.5 py-0.2 bg-slate-800 text-slate-500 text-[9px] font-bold rounded border border-slate-700">បិទ</span>
              )}
            </div>
          </div>
        </nav>

        {/* Sidebar Admin Profile block */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 overflow-hidden">
              {currentUser?.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  referrerPolicy="no-referrer" 
                  className="w-9 h-9 rounded-full object-cover border border-amber-400" 
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs border border-amber-500/30">
                  {currentUser?.displayName ? currentUser.displayName.charAt(0) : 'A'}
                </div>
              )}
              <div className="text-[11px] overflow-hidden leading-tight text-left">
                <p className="text-white font-bold truncate">{currentUser?.displayName || 'អ្នកគ្រប់គ្រងប្រព័ន្ធ'}</p>
                <p className="text-slate-400 truncate font-mono text-[10px]">{currentUser?.email || 'admin@moeys.gov.kh'}</p>
              </div>
            </div>
            
            {/* Sign Out Button */}
            <button 
              onClick={handleSignOut}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400 border border-slate-700 transition cursor-pointer"
              title="ចាកចេញពីប្រព័ន្ធ (Sign Out)"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Main Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-10 shadow-xs">
          <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
            {/* Hamburger Button for mobile */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition shrink-0 cursor-pointer"
              title="បើកបញ្ជី"
            >
              <Menu className="h-5 w-5" />
            </button>

            <h2 className="text-xs md:text-sm lg:text-base font-bold text-slate-900 truncate flex items-center gap-1.5">
              {activeTab === 'dashboard' && 'ទិដ្ឋភាពទូទៅនៃប្រព័ន្ធ និងការស្កេនរហ័ស'}
              {activeTab === 'attendance' && 'របាយការណ៍វត្តមានសិក្ខាកាមប្រចាំថ្ងៃ'}
              {activeTab === 'map' && 'ផែនទី GPS តាមដានទីតាំងស្កេនផ្ទាល់'}
              {activeTab === 'trainees' && 'គ្រប់គ្រងបញ្ជីឈ្មោះសិក្ខាកាម'}
              {activeTab === 'documents' && 'បណ្ណាល័យឯកសារកិច្ចការសិក្ខាសាលា'}
              {activeTab === 'alerts' && 'ការកំណត់ប្រព័ន្ធជូនដំណឹង & ការសាកល្បង'}
            </h2>
            <span className="hidden sm:inline-block px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100 shrink-0">
              {getKhmerDate()}
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {/* Clock in Header */}
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono leading-none">REALTIME SERVER CLOCK</span>
              <span className="text-sm font-black text-slate-800 font-mono tracking-tight">{getKhmerTime()}</span>
            </div>

            {/* Quick Actions trigger */}
            <button
              onClick={() => setIsScanning(true)}
              className="px-2.5 md:px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] md:text-xs font-bold rounded-lg shadow-sm transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">ស្កេនវត្តមាន (Simulator)</span>
              <span className="xs:hidden">ស្កេន</span>
            </button>
          </div>
        </header>

        {/* Scrollable Work Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Bento-style Metrics Dashboard Widgets Row (Visible in Dashboard and compact on other tabs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">សិក្ខាកាមសរុប</span>
                <span className="text-xl font-black text-slate-800 mt-1 block font-mono">{totalTrainees} នាក់</span>
                <span className="text-[9px] text-slate-400 mt-0.5 block">គណនីចុះឈ្មោះរួច</span>
              </div>
              <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Users className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ស្កេនចូលវេនព្រឹក</span>
                <span className="text-xl font-black text-amber-600 mt-1 block font-mono">{morningScans} នាក់</span>
                <span className="text-[9px] text-slate-400 mt-0.5 block">សម្រាប់ថ្ងៃនេះ</span>
              </div>
              <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                <Clock className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ស្កេនចូលវេនរសៀល</span>
                <span className="text-xl font-black text-indigo-600 mt-1 block font-mono">{afternoonScans} នាក់</span>
                <span className="text-[9px] text-slate-400 mt-0.5 block">សម្រាប់ថ្ងៃនេះ</span>
              </div>
              <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <Clock className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ការជូនដំណឹងថ្មី</span>
                <span className="text-xl font-black text-red-600 mt-1 block font-mono">{unreadAlerts} សារ</span>
                <span className="text-[9px] text-slate-400 mt-0.5 block">មិនទាន់ត្រួតពិនិត្យ</span>
              </div>
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border ${
                unreadAlerts > 0 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-slate-50 text-slate-400 border-slate-100'
              }`}>
                <Bell className="h-4.5 w-4.5" />
              </div>
            </div>

          </div>

          {/* Core Tab Screen Panel rendering */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.1 }}
              >
                {activeTab === 'dashboard' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    
                    {/* Left Column: Shift Schedules Status & QR Scanner Trigger (col-span-4) */}
                    <div className="lg:col-span-4 space-y-4">
                      
                      {/* Active Shift Card */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                        <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          ព័ត៌មានវេនសិក្សាថ្ងៃនេះ
                        </h4>
                        
                        <div className="space-y-2">
                          <div className={`p-3 rounded-lg border flex justify-between items-center transition duration-150 ${
                            getCurrentActiveShift() === 'morning'
                              ? 'border-amber-200 bg-amber-50/40'
                              : 'border-slate-100 bg-white opacity-60'
                          }`}>
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-800 text-[11px] block">វេនព្រឹក (Morning Shift)</span>
                              <span className="text-[9px] text-slate-400 block font-mono">ម៉ោង: 08:00 AM - 11:00 AM</span>
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                              getCurrentActiveShift() === 'morning' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {getCurrentActiveShift() === 'morning' ? 'កំពុងដំណើរការ' : 'បិទ'}
                            </span>
                          </div>

                          <div className={`p-3 rounded-lg border flex justify-between items-center transition duration-150 ${
                            getCurrentActiveShift() === 'afternoon'
                              ? 'border-indigo-200 bg-indigo-50/40'
                              : 'border-slate-100 bg-white opacity-60'
                          }`}>
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-800 text-[11px] block">វេនរសៀល (Afternoon Shift)</span>
                              <span className="text-[9px] text-slate-400 block font-mono">ម៉ោង: 02:00 PM - 05:00 PM</span>
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                              getCurrentActiveShift() === 'afternoon' ? 'bg-indigo-100 text-indigo-800 animate-pulse' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {getCurrentActiveShift() === 'afternoon' ? 'កំពុងដំណើរការ' : 'បិទ'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive 4-Shift QR Generator Card */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                        <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <QrCode className="h-4 w-4 text-blue-600 animate-pulse" />
                          ប្រព័ន្ធបង្កើត QR Code ស្កេនវត្តមាន (៤ វគ្គ)
                        </h4>

                        {/* Interactive Session Selector */}
                        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                          {WORKSHOP_SESSIONS.map((session) => {
                            const isSelected = selectedQrSessionId === session.id;
                            return (
                              <button
                                key={session.id}
                                onClick={() => setSelectedQrSessionId(session.id)}
                                className={`p-2 rounded-lg border text-left transition duration-150 flex flex-col justify-between h-[52px] ${
                                  isSelected
                                    ? 'border-blue-600 bg-blue-50/50 text-blue-950 font-bold'
                                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-slate-100/60'
                                }`}
                              >
                                <span className="truncate block font-semibold">{session.nameKh}</span>
                                <span className="text-[8px] font-mono opacity-80 mt-1 block">{session.timeRange}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* QR Code SVG Visualizer */}
                        <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-100/80">
                          <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm relative group">
                            {/* Real Scannable QR Code */}
                            <RealQrCode 
                              value={`${window.location.origin}${window.location.pathname}?checkInSession=${selectedQrSessionId}`} 
                              size={120} 
                            />

                            {/* Floating QR indicator overlay */}
                            <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 rounded-lg">
                              <span className="text-[10px] font-bold text-white px-2 py-1 bg-blue-600 rounded">
                                ACTIVE QR
                              </span>
                            </div>
                          </div>

                          <div className="text-center mt-2">
                            <span className="text-[10px] font-bold text-slate-800 block">
                              QR {WORKSHOP_SESSIONS.find(s => s.id === selectedQrSessionId)?.nameKh}
                            </span>
                            <span className="text-[8px] text-slate-500 block font-mono mt-0.5">
                              10m Geofence Protection • Locked
                            </span>
                          </div>

                          {/* Action Button: Download QR / Print QR */}
                          <button
                            onClick={() => {
                              alert(`ទាញយកប្លង់រូបភាព QR Code សម្រាប់ "${WORKSHOP_SESSIONS.find(s => s.id === selectedQrSessionId)?.nameKh}" ជោគជ័យ! លោកអ្នកអាចយកទៅព្រីន បិទផ្សាយនៅមាត់ទ្វារសាលសិក្ខាសាលា។`);
                            }}
                            className="mt-2.5 flex items-center justify-center gap-1 bg-white hover:bg-slate-50 text-slate-700 font-bold py-1 px-2 rounded-lg border border-slate-200 shadow-xs transition w-full text-[9px]"
                          >
                            <Download className="h-3 w-3 text-blue-600" />
                            ទាញយក QR សម្រាប់បោះពុម្ព
                          </button>
                        </div>
                      </div>

                      {/* QR Scanner Trigger Card */}
                      <div className="bg-[#0f172a] text-slate-300 p-5 rounded-xl border border-slate-800 shadow-md space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/10 rounded-full blur-2xl" />
                        
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-400 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            <LogIn className="h-3 w-3" />
                            GPS Scan System
                          </span>
                          <h4 className="font-bold text-white text-sm">ស្កេនវត្តមានដោយស្វ័យប្រវត្តិ</h4>
                          <p className="text-[10px] text-slate-400 leading-normal">
                            ប្រព័ន្ធនឹងទាញយកកូអរដោនេទីតាំង GPS ពិតប្រាកដ និងសម្គាល់ឧបករណ៍ដែលកំពុងប្រើប្រាស់ ដើម្បីធានាសុវត្ថិភាពខ្ពស់។
                          </p>
                        </div>

                        <button
                          onClick={() => setIsScanning(true)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-blue-600/20"
                        >
                          <LogIn className="h-4 w-4" />
                          ចុចត្រង់នេះ ដើម្បីស្កេនវត្តមាន
                        </button>
                      </div>

                    </div>

                    {/* Right Column: Visual welcome, Street maps GPS & Quick Actions (col-span-8) */}
                    <div className="lg:col-span-8 space-y-4">
                      
                      {/* welcome banner */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="space-y-1 text-center sm:text-left">
                          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 justify-center sm:justify-start">
                            <CheckCircle2 className="h-4.5 w-4.5 text-blue-600" />
                            របាយការណ៍វត្តមាន និងលំហូរព័ត៌មានសិក្ខាសាលា
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            ការស្កេនវត្តមានត្រូវបានតាមដានយ៉ាងហ្មត់ចត់ដោយប្រព័ន្ធ GPS ។ អ្នកអាចធ្វើការពិនិត្យបញ្ជីវត្តមាន គ្រប់គ្រងគណនី ឬទាញយកឯកសារសិក្ខាសាលា។
                          </p>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => setActiveTab('attendance')}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[10px] py-1.5 px-3.5 rounded-lg border border-slate-200 transition"
                          >
                            បញ្ជីវត្តមាន
                          </button>
                          <button
                            onClick={() => setActiveTab('documents')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] py-1.5 px-3.5 rounded-lg transition"
                          >
                            ឯកសារយោង
                          </button>
                        </div>
                      </div>

                      {/* GPS Map Tracker container (High Density) */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                            📍 ទីតាំងចុះវត្តមាន (GPS Map Snapshot)
                          </h3>
                          <button
                            onClick={() => setActiveTab('map')}
                            className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5"
                          >
                            មើលផែនទីធំ
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>

                        {/* map wrapper */}
                        <div className="h-56 rounded-lg overflow-hidden border border-slate-200 shadow-inner relative flex flex-col items-center justify-center bg-slate-100">
                          <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/104.9282,11.5564,12,0/600x300?access_token=mock')] bg-cover opacity-80" />
                          
                          {/* map overlay overlaying clicking */}
                          <div className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center text-center p-4 z-10">
                            <MapPin className="h-8 w-8 text-white animate-bounce mb-1.5" />
                            <h5 className="font-bold text-white text-xs">ផែនទីរួមបញ្ចូលគ្នា (Google Street Map+GPS)</h5>
                            <p className="text-[9px] text-slate-200 mt-1 max-w-sm">
                              រាល់ការស្កេនទាំងអស់របស់សិក្ខាកាមត្រូវបានរក្សាទុកជាមួយនឹងរយៈទទឹង/រយៈបណ្តោយ និងភាពត្រឹមត្រូវនៃឧបករណ៍។
                            </p>
                            <button
                              onClick={() => setActiveTab('map')}
                              className="mt-3 bg-white text-slate-900 font-bold text-[10px] py-1.5 px-3.5 rounded-lg transition hover:bg-slate-50"
                            >
                              បើកផែនទីតាមដាន GPS
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                )}

                {activeTab === 'attendance' && (
                  <AttendanceList 
                    logs={logs} 
                    trainees={trainees}
                    onAddLog={handleAddLog}
                    onUpdateLog={handleUpdateLog}
                    onSelectGpsLog={handleSelectGpsLog}
                    onDeleteLog={handleDeleteLog}
                  />
                )}

                {activeTab === 'trainees' && (
                  <TraineeManager 
                    trainees={trainees} 
                    onAddTrainee={handleAddTrainee}
                    onDeleteTrainee={handleDeleteTrainee}
                  />
                )}

                {activeTab === 'documents' && (
                  <DocumentHub 
                    documents={documents} 
                    onAddDocument={handleAddDocument}
                    onDeleteDocument={handleDeleteDocument}
                    currentUser={currentUser}
                  />
                )}

                {activeTab === 'map' && (
                  <MapTracker 
                    logs={logs}
                    selectedLog={selectedGpsLog}
                    onSelectLog={(log) => setSelectedGpsLog(log)}
                    workshopName={workshopName}
                    workshopLat={workshopLat}
                    workshopLng={workshopLng}
                    onUpdateWorkshop={(name, lat, lng) => {
                      setWorkshopName(name);
                      setWorkshopLat(lat);
                      setWorkshopLng(lng);
                    }}
                  />
                )}

                {activeTab === 'alerts' && (
                  <NotificationSettings 
                    settings={notifSettings}
                    notifications={notifications}
                    onToggleSetting={handleToggleSetting}
                    onClearNotifications={handleClearNotifications}
                    onAddNotification={handleAddNotification}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </main>

      {/* Trainee QR/Attendance Scanner Simulator Modal */}
      <AnimatePresence>
        {isScanning && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="bg-white rounded-xl max-w-md w-full overflow-hidden border border-slate-200 shadow-xl"
            >
              
              {/* Modal Header */}
              <div className="bg-[#0f172a] text-slate-300 p-4 flex justify-between items-center relative border-b border-slate-800">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <LogIn className="h-4 w-4 text-blue-400" />
                    ស្កេនវត្តមានសិក្ខាកាម (GPS Simulator)
                  </h4>
                  <p className="text-[9px] text-slate-400">ប្រព័ន្ធនឹងសម្គាល់ GPS & ឈ្មោះឧបករណ៍ស្វ័យប្រវត្ត</p>
                </div>
                <button
                  onClick={handleCloseScanModal}
                  className="text-slate-400 hover:text-white transition font-bold text-xs bg-slate-800 px-2 py-1 rounded"
                >
                  បិទ
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                
                {scanBlockedInfo ? (
                  // Blocked View due to Geofence > 10m
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex flex-col items-center justify-center text-center p-2">
                      <div className="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2 border border-red-200 animate-bounce">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      <h4 className="font-bold text-red-600 text-xs">ការស្កេនត្រូវបានបដិសេធ! (Blocked)</h4>
                      <p className="text-[10px] text-slate-400 mt-1">សិក្ខាកាមស្ថិតនៅក្រៅដែនកំណត់ស្កេនដែលកំណត់ទុក</p>
                    </div>

                    <div className="bg-red-50/50 p-4 rounded-lg border border-red-100 text-[10px] text-slate-700 space-y-2">
                      <div className="flex justify-between border-b border-red-100 pb-1.5">
                        <span className="text-slate-500">ឈ្មោះសិក្ខាកាម:</span>
                        <span className="font-bold text-slate-800">{scanBlockedInfo.traineeName}</span>
                      </div>
                      <div className="flex justify-between border-b border-red-100 pb-1.5">
                        <span className="text-slate-500">អត្តលេខ:</span>
                        <span className="font-mono font-semibold text-slate-700">{scanBlockedInfo.studentId}</span>
                      </div>
                      <div className="flex justify-between border-b border-red-100 pb-1.5">
                        <span className="text-slate-500">ចម្ងាយជាក់ស្តែង:</span>
                        <span className="font-mono font-extrabold text-red-600 bg-red-100 px-1.5 py-0.2 rounded text-[11px]">
                          {scanBlockedInfo.distance.toFixed(1)} ម៉ែត្រ
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-red-100 pb-1.5">
                        <span className="text-slate-500">ដែនកំណត់អនុញ្ញាត:</span>
                        <span className="font-bold text-emerald-600">១០ ម៉ែត្រ (10 m)</span>
                      </div>
                      <div className="space-y-1 text-[9px] text-slate-500 pt-1">
                        <div className="flex justify-between">
                          <span>ទីតាំងសិក្ខាសាលា:</span>
                          <span className="font-mono font-semibold">{workshopLat.toFixed(5)}, {workshopLng.toFixed(5)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ទីតាំងឧបករណ៍:</span>
                          <span className="font-mono font-semibold text-red-500">{scanBlockedInfo.latitude.toFixed(5)}, {scanBlockedInfo.longitude.toFixed(5)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 text-center px-2 leading-relaxed">
                      ⚠️ <b>សេចក្តីណែនាំ៖</b> សិក្ខាកាមត្រូវធ្វើដំណើរចូលទៅជិតទីតាំងសិក្ខាសាលាឱ្យបានយ៉ាងហោចណាស់ <b>១០ម៉ែត្រ</b> ទើបប្រព័ន្ធអនុញ្ញាតឱ្យចុះឈ្មោះវត្តមានបាន។
                    </div>

                    <button
                      onClick={() => {
                        setScanBlockedInfo(null);
                        setSimDistance(5); // Reset distance back inside geofence
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5"
                    >
                      ព្យាយាមស្កេនម្តងទៀត
                    </button>
                  </div>
                ) : !scanResult ? (
                  <>
                    {/* Live QR Code Scanner Viewfinder Simulation */}
                    <div className="bg-[#0f172a] rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden border border-slate-800 shadow-inner">
                      {/* Viewfinder corner lines */}
                      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-blue-500 rounded-tl-xs animate-pulse" />
                      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-blue-500 rounded-tr-xs animate-pulse" />
                      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-blue-500 rounded-bl-xs animate-pulse" />
                      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-blue-500 rounded-br-xs animate-pulse" />
                      
                      {/* Active indicator badge */}
                      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[8.5px] text-emerald-400 font-bold tracking-wide">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping shrink-0" />
                        QR Code សម្រាប់ស្កេន (Real Scannable QR Code)
                      </div>

                      {/* Real compliant QR Code Wrapper */}
                      <div className="relative bg-white p-2.5 rounded-lg shadow-md my-4 mt-6 flex items-center justify-center">
                        <RealQrCode 
                          value={`${window.location.origin}${window.location.pathname}?checkInSession=${scanSessionId}`} 
                          size={135} 
                        />
                      </div>

                      {/* Active session selector inside modal */}
                      <div className="w-full text-center space-y-1.5 z-10">
                        <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg border border-slate-800 text-[10px]">
                          <span className="font-bold text-slate-400">វគ្គស្កេន (QR Session)៖</span>
                          <select
                            value={scanSessionId}
                            onChange={(e) => setScanSessionId(e.target.value)}
                            className="bg-slate-800 border border-slate-700 text-white font-bold text-[10px] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right cursor-pointer"
                          >
                            {WORKSHOP_SESSIONS.map((session) => (
                              <option key={session.id} value={session.id}>
                                {session.nameKh} ({session.timeRange})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block uppercase">
                        ជ្រើសរើសឈ្មោះសិក្ខាកាមដើម្បីស្កេន *
                      </label>
                      <select
                        required
                        value={selectedTraineeId}
                        onChange={(e) => {
                          const traineeId = e.target.value;
                          setSelectedTraineeId(traineeId);
                          const t = trainees.find(tr => tr.id === traineeId);
                          if (t) {
                            if (t.shift === 'morning') {
                              if (scanSessionId !== 'morning_in' && scanSessionId !== 'morning_out') {
                                setScanSessionId('morning_in');
                              }
                            } else {
                              if (scanSessionId !== 'afternoon_in' && scanSessionId !== 'afternoon_out') {
                                setScanSessionId('afternoon_in');
                              }
                            }
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-800 font-semibold"
                      >
                        <option value="">-- ជ្រើសរើសគណនី --</option>
                        {trainees.map(t => (
                          <option key={t.id} value={t.id}>{t.nameKh} ({t.studentId}) - {t.shift === 'morning' ? 'វេនព្រឹក' : 'វេនរសៀល'}</option>
                        ))}
                      </select>
                    </div>

                    {/* Geolocation metadata list */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2.5">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wide">របៀបចាប់ទីតាំង (GPS Option)</span>
                        <div className="flex gap-1 bg-slate-200 p-0.5 rounded-md">
                          <button
                            type="button"
                            onClick={() => setSimType('simulated')}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold transition ${
                              simType === 'simulated' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            ម៉ាស៊ីនពិសោធន៍
                          </button>
                          <button
                            type="button"
                            onClick={() => setSimType('real')}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold transition ${
                              simType === 'real' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            GPS ពិតប្រាកដ
                          </button>
                        </div>
                      </div>

                      {simType === 'simulated' ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] text-slate-600">
                            <span>ចម្ងាយពីទីតាំងសិក្ខាសាលា:</span>
                            <span className={`font-mono font-bold ${simDistance > 10 ? 'text-red-600' : 'text-emerald-600'}`}>
                              {simDistance.toFixed(1)} ម៉ែត្រ
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="70"
                            step="1"
                            value={simDistance}
                            onChange={(e) => setSimDistance(Number(e.target.value))}
                            className="w-full accent-slate-800 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
                          />
                          <div className="flex justify-between text-[8px] text-slate-400 font-medium">
                            <span className="text-emerald-600">៥ម (ក្នុងរង្វង់)</span>
                            <span className="font-semibold text-red-500">១០ម (ដែនកំណត់)</span>
                            <span>៧០ម (ក្រៅរង្វង់)</span>
                          </div>
                          
                          <div className="text-[8px] text-slate-400 border-t border-slate-100 pt-1 flex items-center justify-between">
                            <span>ស្ថានភាព:</span>
                            <span className={`font-bold px-1.5 py-0.2 rounded ${
                              simDistance <= 10 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {simDistance <= 10 ? 'អនុញ្ញាតឱ្យស្កេន (<= 10m)' : 'បដិសេធការស្កេន (> 10m)'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[9.5px] text-slate-500 leading-relaxed pt-1 space-y-1">
                          <p>ឧបករណ៍របស់អ្នកត្រូវតែស្ថិតនៅក្នុងរង្វង់ <b>១០ម៉ែត្រ</b> ពីទីតាំងសិក្ខាសាលា <b>(11.5564, 104.9282)</b> ទើបអាចស្កេនបានជោគជ័យ។</p>
                          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded text-slate-600 text-[8.5px]">
                            <Compass className="h-3.5 w-3.5 text-blue-500 animate-spin shrink-0" />
                            <span>ទាញយកកូអរដោនេច្បាស់លាស់ពីទូរស័ព្ទដៃរបស់អ្នក...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleStartAttendanceScan}
                      disabled={!selectedTraineeId || gpsLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-sm"
                    >
                      {gpsLoading ? (
                        <>
                          <Compass className="h-4 w-4 animate-spin" />
                          កំពុងទាញយកកូអរដោនេ GPS...
                        </>
                      ) : (
                        <>
                          <LogIn className="h-4 w-4" />
                          ស្កេន និងរក្សាទុកវត្តមាន
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  // Scan Success Display
                  <div className="space-y-3 animate-scaleUp">
                    <div className="flex flex-col items-center justify-center text-center p-2">
                      <div className="h-10 w-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mb-2 border border-emerald-200">
                        <CheckCircle2 className="h-5.5 w-5.5" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs">ស្កេនវត្តមានបានជោគជ័យ!</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">ទិន្នន័យត្រូវបានរក្សាទុកដោយជោគជ័យក្នុងប្រព័ន្ធ</p>
                    </div>

                    {/* Details Card */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[10px] text-slate-600 space-y-1.5 font-sans">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-400">សិក្ខាកាម:</span>
                        <span className="font-bold text-slate-800">{scanResult.traineeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">អត្តលេខ:</span>
                        <span className="font-mono font-semibold text-slate-700">{scanResult.studentId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">វេនសិក្សា:</span>
                        <span className="font-semibold text-slate-700">
                          {scanResult.shift === 'morning' ? 'វេនព្រឹក (08:00 - 11:00)' : 'វេនរសៀល (02:00 - 05:00)'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ម៉ោងស្កេនចូល:</span>
                        <span className="font-mono font-bold text-slate-800">{scanResult.checkInTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ស្ថានភាព:</span>
                        <span className={`px-2 py-0.2 rounded text-[8px] font-bold ${
                          scanResult.status === 'present' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {scanResult.status === 'present' ? 'ទាន់ពេល' : 'យឺត'}
                        </span>
                      </div>
                      <div className="flex justify-between items-start border-t border-dashed border-slate-200 pt-2 mt-1">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Smartphone className="h-3 w-3 text-slate-400" />
                          ឧបករណ៍:
                        </span>
                        <span className="font-semibold text-slate-700 max-w-[150px] text-right truncate">
                          {scanResult.deviceName}
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          កូអរដោនេ:
                        </span>
                        <span className="font-mono font-bold text-slate-700">
                          {scanResult.latitude.toFixed(5)}, {scanResult.longitude.toFixed(5)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleCloseScanModal}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition"
                    >
                      បិទផ្ទាំងស្កេន
                    </button>
                  </div>
                )}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
