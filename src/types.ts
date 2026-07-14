export type ShiftType = 'morning' | 'afternoon';
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';
export type DocumentType = 'photo' | 'drive' | 'classroom' | 'doc' | 'office';
export type OfficeFileType = 'word' | 'excel' | 'powerpoint';

export interface WorkshopSession {
  id: string;
  nameKh: string;
  nameEn: string;
  timeRange: string;
  startTime: string;
  endTime: string;
  type: 'check_in' | 'check_out';
  shift: ShiftType;
}

export interface Trainee {
  id: string;
  nameKh: string;
  nameEn: string;
  studentId: string;
  email: string;
  phone: string;
  gender: 'ប្រុស' | 'ស្រី';
  shift: ShiftType;
  joinedDate: string;
}

export interface AttendanceLog {
  id: string;
  traineeId: string;
  traineeName: string;
  studentId: string;
  shift: ShiftType;
  date: string; // YYYY-MM-DD
  checkInTime: string; // e.g. "08:05 AM"
  checkOutTime: string | null;
  status: AttendanceStatus;
  deviceName: string;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  notes?: string;
}

export interface WorkshopDocument {
  id: string;
  title: string;
  type: DocumentType;
  category: string;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  fileSize?: string;
  description?: string;
  officeType?: OfficeFileType;
}

export interface NotificationSetting {
  id: string;
  type: 'late' | 'checkout' | 'shift_start' | 'shift_end';
  title: string;
  timeWindow: string; // e.g. "08:15 AM"
  enabled: boolean;
  soundEnabled: boolean;
}

export interface ManagerNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: 'info' | 'warning' | 'alert';
}
