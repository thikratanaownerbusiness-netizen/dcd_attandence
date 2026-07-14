import { useState, FormEvent } from 'react';
import { AttendanceLog, Trainee, ShiftType, AttendanceStatus } from '../types';
import { Search, MapPin, Smartphone, Check, Clock, AlertTriangle, LogOut, CheckCircle2, UserCheck, Plus, X, Trash2 } from 'lucide-react';

interface AttendanceListProps {
  logs: AttendanceLog[];
  trainees: Trainee[];
  onAddLog: (log: AttendanceLog) => void;
  onUpdateLog: (id: string, updates: Partial<AttendanceLog>) => void;
  onSelectGpsLog: (log: AttendanceLog) => void;
  onDeleteLog: (id: string) => void;
}

export default function AttendanceList({ logs, trainees, onAddLog, onUpdateLog, onSelectGpsLog, onDeleteLog }: AttendanceListProps) {
  const [activeShift, setActiveShift] = useState<ShiftType>('morning');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');
  const [isManualCheckIn, setIsManualCheckIn] = useState(false);

  // Manual CheckIn form state
  const [selectedTraineeId, setSelectedTraineeId] = useState('');
  const [checkInTime, setCheckInTime] = useState('08:00 AM');
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('present');
  const [manualNotes, setManualNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Get trainees for manual check-in who haven't checked in today for the active shift
  const eligibleTrainees = trainees.filter((t) => {
    const hasLog = logs.some((l) => l.traineeId === t.id && l.shift === activeShift && l.date === todayStr);
    return !hasLog && t.shift === activeShift;
  });

  const handleManualCheckIn = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTraineeId) return;

    const trainee = trainees.find(t => t.id === selectedTraineeId);
    if (!trainee) return;

    const newLog: AttendanceLog = {
      id: `L-${Date.now()}`,
      traineeId: trainee.id,
      traineeName: trainee.nameKh,
      studentId: trainee.studentId,
      shift: activeShift,
      date: todayStr,
      checkInTime,
      checkOutTime: null,
      status: manualStatus,
      deviceName: 'ប្រព័ន្ធគ្រប់គ្រង - Manual Scan',
      latitude: 11.5564, // Default Phnom Penh
      longitude: 104.9282,
      accuracy: 1,
      notes: manualNotes,
    };

    onAddLog(newLog);
    setSelectedTraineeId('');
    setManualNotes('');
    setIsManualCheckIn(false);
  };

  const handleCheckOut = (logId: string) => {
    const now = new Date();
    const checkOutTimeStr = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    onUpdateLog(logId, { checkOutTime: checkOutTimeStr });
  };

  // Filter logs based on search, active shift, and status filters
  const filteredLogs = logs.filter((log) => {
    const matchesShift = log.shift === activeShift;
    const matchesSearch = log.traineeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesShift && matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
            <Check className="h-3 w-3" />
            ទាន់ពេល
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
            <Clock className="h-3 w-3" />
            យឺត
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
            <AlertTriangle className="h-3 w-3" />
            អវត្តមាន
          </span>
        );
      case 'excused':
        return (
          <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
            <CheckCircle2 className="h-3 w-3" />
            ច្បាប់
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Shift Selection Cards (Morning vs Afternoon) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => {
            setActiveShift('morning');
            setStatusFilter('all');
          }}
          className={`p-5 rounded-2xl border text-left transition duration-300 relative overflow-hidden flex items-center justify-between group ${
            activeShift === 'morning'
              ? 'border-amber-400 bg-amber-50/50 shadow-sm ring-1 ring-amber-400'
              : 'border-slate-100 bg-white hover:bg-slate-50'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`h-2.5 w-2.5 rounded-full ${activeShift === 'morning' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
              <h4 className="font-bold text-slate-800 text-base">វេនព្រឹក (Morning Shift)</h4>
            </div>
            <p className="text-xs text-slate-500 font-medium">ម៉ោងកំណត់វត្តមាន: 08:00 AM - 11:00 AM</p>
          </div>
          <Clock className={`h-8 w-8 transition ${activeShift === 'morning' ? 'text-amber-500' : 'text-slate-300'}`} />
        </button>

        <button
          onClick={() => {
            setActiveShift('afternoon');
            setStatusFilter('all');
          }}
          className={`p-5 rounded-2xl border text-left transition duration-300 relative overflow-hidden flex items-center justify-between group ${
            activeShift === 'afternoon'
              ? 'border-indigo-400 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-400'
              : 'border-slate-100 bg-white hover:bg-slate-50'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`h-2.5 w-2.5 rounded-full ${activeShift === 'afternoon' ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
              <h4 className="font-bold text-slate-800 text-base">វេនរសៀល (Afternoon Shift)</h4>
            </div>
            <p className="text-xs text-slate-500 font-medium">ម៉ោងកំណត់វត្តមាន: 02:00 PM - 05:00 PM</p>
          </div>
          <Clock className={`h-8 w-8 transition ${activeShift === 'afternoon' ? 'text-indigo-500' : 'text-slate-300'}`} />
        </button>
      </div>

      {/* Manual CheckIn Panel / Add Manual Log */}
      {isManualCheckIn && (
        <form onSubmit={handleManualCheckIn} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 max-w-2xl animate-fadeIn">
          <div className="flex justify-between items-center border-b border-slate-50 pb-2">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <UserCheck className="h-4.5 w-4.5 text-emerald-600" />
              កត់ត្រាវត្តមានផ្ទាល់ដៃ ({activeShift === 'morning' ? 'វេនព្រឹក' : 'វេនរសៀល'})
            </h4>
            <button type="button" onClick={() => setIsManualCheckIn(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 block">ជ្រើសរើសសិក្ខាកាម *</label>
              {eligibleTrainees.length === 0 ? (
                <div className="text-xs text-red-500 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-100">
                  មិនមានសិក្ខាកាមដែលអាចស្កេនបន្ថែមក្នុងវេននេះសម្រាប់ថ្ងៃនេះឡើយ។
                </div>
              ) : (
                <select
                  required
                  value={selectedTraineeId}
                  onChange={(e) => setSelectedTraineeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-slate-800"
                >
                  <option value="">-- ជ្រើសរើសសិក្ខាកាម --</option>
                  {eligibleTrainees.map(t => (
                    <option key={t.id} value={t.id}>{t.nameKh} ({t.studentId})</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 block">ម៉ោងស្កេន *</label>
              <input
                type="text"
                required
                placeholder="ឧ. 08:05 AM"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-slate-800 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 block">ស្ថានភាព *</label>
              <select
                value={manualStatus}
                onChange={(e) => setManualStatus(e.target.value as AttendanceStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-slate-800"
              >
                <option value="present">ទាន់ពេល (On-Time)</option>
                <option value="late">យឺត (Late)</option>
                <option value="excused">ច្បាប់ (Excused/Leave)</option>
                <option value="absent">អវត្តមាន (Absent)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 block">កំណត់ចំណាំបន្ថែម</label>
              <input
                type="text"
                placeholder="ឧ. មកដល់យឺតដោយសារធ្លាក់ខ្យល់ខ្លាំង..."
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsManualCheckIn(false)}
              className="px-4 py-2 border border-slate-100 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={!selectedTraineeId}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 px-5 rounded-xl text-sm transition disabled:opacity-50"
            >
              កត់ត្រាវត្តមាន
            </button>
          </div>
        </form>
      )}

      {/* Search & Actions Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="ស្វែងរកតាម ឈ្មោះ ឬអត្តលេខ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-slate-800 transition text-slate-800"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex gap-1.5">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              ទាំងអស់ ({filteredLogs.length})
            </button>
            <button
              onClick={() => setStatusFilter('present')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'present'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              ទាន់ពេល
            </button>
            <button
              onClick={() => setStatusFilter('late')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'late'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              យឺត
            </button>
          </div>

          <button
            onClick={() => setIsManualCheckIn(!isManualCheckIn)}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-800 font-semibold text-xs py-2 px-4 rounded-xl transition"
          >
            <Plus className="h-4 w-4" />
            កត់ត្រាវត្តមាន
          </button>
        </div>
      </div>

      {/* Main Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-slate-600">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                <th className="py-2.5 px-4">ព័ត៌មានសិក្ខាកាម</th>
                <th className="py-2.5 px-3">អត្តលេខ</th>
                <th className="py-2.5 px-3">ម៉ោងស្កេនចូល</th>
                <th className="py-2.5 px-3">ម៉ោងស្កេនចេញ</th>
                <th className="py-2.5 px-3">ស្ថានភាព</th>
                <th className="py-2.5 px-3">ឧបករណ៍</th>
                <th className="py-2.5 px-3 text-center">ទីតាំង GPS</th>
                <th className="py-2.5 px-4 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    មិនមានទិន្នន័យវត្តមានសម្រាប់តម្រងនេះឡើយ
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition">
                    
                    {/* Trainee Profile Name */}
                    <td className="py-2 px-4 font-bold text-slate-800 text-xs">
                      <div>
                        <span>{log.traineeName}</span>
                        {log.notes && (
                          <div className="text-[9px] text-amber-600 font-medium font-sans mt-0.5 max-w-xs truncate" title={log.notes}>
                            📝 {log.notes}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Student ID */}
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-500 font-semibold">
                      {log.studentId}
                    </td>

                    {/* Check In Time */}
                    <td className="py-2 px-3 font-mono text-[11px] font-bold text-slate-700">
                      {log.checkInTime}
                    </td>

                    {/* Check Out Time */}
                    <td className="py-2 px-3 font-mono text-[11px]">
                      {log.checkOutTime ? (
                        <span className="font-bold text-slate-700">{log.checkOutTime}</span>
                      ) : (
                        <span className="text-slate-400 font-sans italic text-[10px]">មិនទាន់ចេញ</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-2 px-3">
                      {getStatusBadge(log.status)}
                    </td>

                    {/* Device Used */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Smartphone className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[100px]" title={log.deviceName}>
                          {log.deviceName}
                        </span>
                      </div>
                    </td>

                    {/* GPS Coordinates Button */}
                    <td className="py-2 px-3 text-center">
                      {log.latitude && log.longitude ? (
                        <button
                          onClick={() => onSelectGpsLog(log)}
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-1.5 py-0.5 rounded font-semibold transition"
                          title="មើលទីតាំងលើផែនទី"
                        >
                          <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                          <span className="font-mono text-[10px]">
                            {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
                          </span>
                        </button>
                      ) : (
                        <span className="text-slate-300 italic text-[10px]">គ្មាន GPS</span>
                      )}
                    </td>

                    {/* Checkout and Delete Action */}
                    <td className="py-2 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!log.checkOutTime && log.status !== 'absent' && log.status !== 'excused' ? (
                          <button
                            onClick={() => handleCheckOut(log.id)}
                            className="inline-flex items-center gap-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1 px-2 rounded-lg transition shrink-0"
                          >
                            <LogOut className="h-3 w-3" />
                            ស្កេនចេញ
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium mr-1.5">រួចរាល់</span>
                        )}

                        <button
                          onClick={() => onDeleteLog(log.id)}
                          className="p-1.5 border border-slate-100 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition duration-150 shrink-0"
                          title="លុបកំណត់ត្រានេះ"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
