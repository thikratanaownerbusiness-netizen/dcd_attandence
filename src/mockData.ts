import { Trainee, AttendanceLog, WorkshopDocument, NotificationSetting, ManagerNotification } from './types';

// Detect Device helper
export function detectDevice(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  let browser = 'Browser';
  if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('edge')) browser = 'Edge';

  let os = 'Unknown OS';
  if (ua.includes('iphone')) os = 'iPhone (iOS)';
  else if (ua.includes('ipad')) os = 'iPad (iPadOS)';
  else if (ua.includes('android')) os = 'Android Phone';
  else if (ua.includes('macintosh')) os = 'macOS';
  else if (ua.includes('windows')) os = 'Windows PC';
  else if (ua.includes('linux')) os = 'Linux';

  return `${os} - ${browser}`;
}

export const INITIAL_TRAINEES: Trainee[] = [
  {
    id: 'T-001',
    nameKh: 'សុខ ដារ៉ា',
    nameEn: 'Sok Dara',
    studentId: 'ST-2026-001',
    email: 'dara.sok@gmail.com',
    phone: '012 345 678',
    gender: 'ប្រុស',
    shift: 'morning',
    joinedDate: '2026-01-10',
  },
  {
    id: 'T-002',
    nameKh: 'កែវ ផល្លា',
    nameEn: 'Keo Phalla',
    studentId: 'ST-2026-002',
    email: 'phalla.keo@gmail.com',
    phone: '093 789 123',
    gender: 'ស្រី',
    shift: 'morning',
    joinedDate: '2026-01-12',
  },
  {
    id: 'T-003',
    nameKh: 'ចាន់ សូភី',
    nameEn: 'Chan Sophy',
    studentId: 'ST-2026-003',
    email: 'sophy.chan@gmail.com',
    phone: '085 222 333',
    gender: 'ស្រី',
    shift: 'afternoon',
    joinedDate: '2026-01-15',
  },
  {
    id: 'T-004',
    nameKh: 'ហេង វ៉ាន់ឌី',
    nameEn: 'Heng Vandy',
    studentId: 'ST-2026-004',
    email: 'vandy.heng@gmail.com',
    phone: '010 444 555',
    gender: 'ប្រុស',
    shift: 'afternoon',
    joinedDate: '2026-01-15',
  },
  {
    id: 'T-005',
    nameKh: 'ងួន សុភ័ក្ត្រ',
    nameEn: 'Nguon Sopheak',
    studentId: 'ST-2026-005',
    email: 'sopheak.nguon@gmail.com',
    phone: '077 666 777',
    gender: 'ប្រុស',
    shift: 'morning',
    joinedDate: '2026-01-18',
  },
  {
    id: 'T-006',
    nameKh: 'មាស សំណាង',
    nameEn: 'Meas Samnang',
    studentId: 'ST-2026-006',
    email: 'samnang.meas@gmail.com',
    phone: '098 999 888',
    gender: 'ស្រី',
    shift: 'afternoon',
    joinedDate: '2026-01-20',
  },
];

export const INITIAL_ATTENDANCE_LOGS: AttendanceLog[] = [
  {
    id: 'L-001',
    traineeId: 'T-001',
    traineeName: 'សុខ ដារ៉ា',
    studentId: 'ST-2026-001',
    shift: 'morning',
    date: '2026-07-12',
    checkInTime: '07:52 AM',
    checkOutTime: '11:02 AM',
    status: 'present',
    deviceName: 'iPhone (iOS) - Safari',
    latitude: 11.5564,
    longitude: 104.9282,
    accuracy: 8,
    notes: 'មកដល់ទាន់ពេល និងរៀបចំទុកដាក់សម្ភារៈរួចរាល់',
  },
  {
    id: 'L-002',
    traineeId: 'T-002',
    traineeName: 'កែវ ផល្លា',
    studentId: 'ST-2026-002',
    shift: 'morning',
    date: '2026-07-12',
    checkInTime: '08:18 AM',
    checkOutTime: '11:00 AM',
    status: 'late',
    deviceName: 'Android Phone - Chrome',
    latitude: 11.5621,
    longitude: 104.9125,
    accuracy: 15,
    notes: 'យឺត ១៨នាទី ដោយសារស្ទះចរាចរណ៍នៅស្ពានអាកាស',
  },
  {
    id: 'L-003',
    traineeId: 'T-005',
    traineeName: 'ងួន សុភ័ក្ត្រ',
    studentId: 'ST-2026-005',
    shift: 'morning',
    date: '2026-07-12',
    checkInTime: '07:58 AM',
    checkOutTime: '11:01 AM',
    status: 'present',
    deviceName: 'Windows PC - Edge',
    latitude: 11.5582,
    longitude: 104.9311,
    accuracy: 5,
    notes: 'ស្កេនតាមរយៈកុំព្យូទ័របន្ទប់ពិសោធន៍',
  },
  {
    id: 'L-004',
    traineeId: 'T-003',
    traineeName: 'ចាន់ សូភី',
    studentId: 'ST-2026-003',
    shift: 'afternoon',
    date: '2026-07-12',
    checkInTime: '01:50 PM',
    checkOutTime: null,
    status: 'present',
    deviceName: 'iPhone (iOS) - Safari',
    latitude: 11.5498,
    longitude: 104.9214,
    accuracy: 12,
  },
  {
    id: 'L-005',
    traineeId: 'T-004',
    traineeName: 'ហេង វ៉ាន់ឌី',
    studentId: 'ST-2026-004',
    shift: 'afternoon',
    date: '2026-07-12',
    checkInTime: '02:22 PM',
    checkOutTime: null,
    status: 'late',
    deviceName: 'macOS - Chrome',
    latitude: 11.5512,
    longitude: 104.9356,
    accuracy: 10,
    notes: 'យឺត ២២នាទី',
  },
];

export const INITIAL_DOCUMENTS: WorkshopDocument[] = [
  // Photos
  {
    id: 'D-001',
    title: 'សកម្មភាពពិភាក្សាក្រុមសិក្ខាសាលាវគ្គទី១',
    type: 'photo',
    category: 'រូបភាពសកម្មភាព',
    url: 'https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&q=80&w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&q=80&w=400',
    uploadedBy: 'លោកគ្រូ ចាន់ ណារ៉ុង',
    uploadedAt: '2026-07-10 10:30 AM',
    fileSize: '2.4 MB',
    description: 'សិក្ខាកាមកំពុងធ្វើការពិភាក្សាយ៉ាងសកម្មលើប្រធានបទ UX/UI Design',
  },
  {
    id: 'D-002',
    title: 'បទបង្ហាញគម្រោងចុងក្រោយរបស់សិក្ខាកាម',
    type: 'photo',
    category: 'រូបភាពសកម្មភាព',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400',
    uploadedBy: 'លោកគ្រូ ចាន់ ណារ៉ុង',
    uploadedAt: '2026-07-11 03:45 PM',
    fileSize: '1.8 MB',
    description: 'សិក្ខាកាមឡើងការពារប្រធានបទ Web Development Project',
  },
  {
    id: 'D-003',
    title: 'ទិដ្ឋភាពរួមនៃថ្នាក់រៀនវគ្គព្រឹក',
    type: 'photo',
    category: 'រូបភាពសកម្មភាព',
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400',
    uploadedBy: 'អ្នកគ្រូ លី ដាណេ',
    uploadedAt: '2026-07-12 09:15 AM',
    fileSize: '3.1 MB',
    description: 'ការអនុវត្តផ្ទាល់ជាមួយការបង្កើត Full-Stack web application',
  },

  // Google Drive
  {
    id: 'D-004',
    title: 'ស្លាយមេរៀនស្ដីពី JavaScript ES6+ & Async/Await',
    type: 'drive',
    category: 'Google Drive',
    url: 'https://drive.google.com/drive/folders/react-training-course',
    uploadedBy: 'លោកគ្រូ ចាន់ ណារ៉ុង',
    uploadedAt: '2026-07-08 09:00 AM',
    fileSize: '5.2 MB',
    description: 'ស្លាយមេរៀនលម្អិតសម្រាប់ការសិក្សាស្រាវជ្រាវបន្ថែម',
  },
  {
    id: 'D-005',
    title: 'ថតឯកសារយោងសម្រាប់ការរចនា Interface',
    type: 'drive',
    category: 'Google Drive',
    url: 'https://drive.google.com/drive/folders/ui-ux-references-2026',
    uploadedBy: 'អ្នកគ្រូ លី ដាណេ',
    uploadedAt: '2026-07-09 02:00 PM',
    description: 'ប្រមូលផ្ដុំដោយគំរូរចនាស្អាតៗ និង Icons សម្រាប់គម្រោង',
  },

  // Google Doc
  {
    id: 'D-006',
    title: 'សេចក្ដីណែនាំអំពីកិច្ចការស្រាវជ្រាវ (Research Guideline)',
    type: 'doc',
    category: 'Google Doc',
    url: 'https://docs.google.com/document/d/guidelines-for-students',
    uploadedBy: 'លោកគ្រូ ចាន់ ណារ៉ុង',
    uploadedAt: '2026-07-07 01:10 PM',
    description: 'របៀបសរសេររបាយការណ៍ និងការកំណត់ទម្រង់ឯកសារស្រាវជ្រាវ',
  },
  {
    id: 'D-007',
    title: 'កំណត់ហេតុប្រជុំគណៈកម្មការបច្ចេកវិទ្យា',
    type: 'doc',
    category: 'Google Doc',
    url: 'https://docs.google.com/document/d/meeting-minutes-july-10',
    uploadedBy: 'អ្នកគ្រូ លី ដាណេ',
    uploadedAt: '2026-07-10 05:00 PM',
    description: 'ការពិភាក្សាលើវឌ្ឍនភាពសិក្ខាកាម និងកែលម្អការបង្រៀន',
  },

  // Google Classroom
  {
    id: 'D-008',
    title: 'ថ្នាក់រៀន: Web App Engineering (Class Code: w3b4pp)',
    type: 'classroom',
    category: 'Google Classroom',
    url: 'https://classroom.google.com/c/web-app-eng-2026',
    uploadedBy: 'លោកគ្រូ ចាន់ ណារ៉ុង',
    uploadedAt: '2026-07-05 08:30 AM',
    description: 'កន្លែងដាក់កិច្ចការផ្ទះ (Assignments) និងការប្រកាសដំណឹងផ្សេងៗ',
  },

  // Microsoft Office
  {
    id: 'D-009',
    title: 'គ្រោងមេរៀនលម្អិតប្រចាំវគ្គសិក្សា (Syllabus)',
    type: 'office',
    officeType: 'word',
    category: 'Microsoft Office',
    url: 'office-doc-syllabus',
    uploadedBy: 'លោកគ្រូ ចាន់ ណារ៉ុង',
    uploadedAt: '2026-07-05 10:00 AM',
    fileSize: '450 KB',
    description: 'ឯកសាររៀបចំជាទម្រង់ MS Word (docx) បញ្ជាក់ពីកាលវិភាគមេរៀន',
  },
  {
    id: 'D-010',
    title: 'តារាងពិន្ទុវាយតម្លៃ និងវត្តមានសិក្ខាកាមសរុប',
    type: 'office',
    officeType: 'excel',
    category: 'Microsoft Office',
    url: 'office-doc-grades',
    uploadedBy: 'អ្នកគ្រូ លី ដាណេ',
    uploadedAt: '2026-07-12 11:30 AM',
    fileSize: '1.2 MB',
    description: 'តារាង MS Excel (xlsx) សម្រាប់តាមដានពិន្ទុ និងការធ្វើតេស្តនានា',
  },
  {
    id: 'D-011',
    title: 'ស្លាយបទបង្ហាញសំណើគម្រោងសិក្ខាសាលា',
    type: 'office',
    officeType: 'powerpoint',
    category: 'Microsoft Office',
    url: 'office-doc-slides',
    uploadedBy: 'លោកគ្រូ ចាន់ ណារ៉ុង',
    uploadedAt: '2026-07-06 02:00 PM',
    fileSize: '4.8 MB',
    description: 'គំរូស្លាយជាទម្រង់ MS PowerPoint (pptx) សម្រាប់រៀបចំបទបង្ហាញ',
  },
];

export const INITIAL_NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: 'N-001',
    type: 'late',
    title: 'ជូនដំណឹងនៅពេលសិក្ខាកាមមកយឺត (លើសពី 15 នាទី)',
    timeWindow: '08:15 AM',
    enabled: true,
    soundEnabled: true,
  },
  {
    id: 'N-002',
    type: 'checkout',
    title: 'ជូនដំណឹងនៅពេលសិក្ខាកាមបានស្កេនចេញ',
    timeWindow: '11:00 AM',
    enabled: true,
    soundEnabled: false,
  },
  {
    id: 'N-003',
    type: 'shift_start',
    title: 'រំលឹកពេលចាប់ផ្ដើមវេនព្រឹក (08:00 AM)',
    timeWindow: '08:00 AM',
    enabled: true,
    soundEnabled: true,
  },
  {
    id: 'N-004',
    type: 'shift_end',
    title: 'រំលឹកពេលបញ្ចប់វេនរសៀល (05:00 PM)',
    timeWindow: '05:00 PM',
    enabled: true,
    soundEnabled: true,
  },
];

export const INITIAL_MANAGER_NOTIFICATIONS: ManagerNotification[] = [
  {
    id: 'M-001',
    title: 'វត្តមានសិក្ខាកាមយឺត',
    message: 'សិក្ខាកាម កែវ ផល្លា បានស្កេនវត្តមានយឺត ១៨នាទី (វេនព្រឹក) តាមរយៈ Android Phone - Chrome។ ទីតាំង GPS: 11.5621, 104.9125',
    timestamp: '2026-07-12 08:18 AM',
    read: false,
    severity: 'warning',
  },
  {
    id: 'M-002',
    title: 'វត្តមានសិក្ខាកាមយឺត',
    message: 'សិក្ខាកាម ហេង វ៉ាន់ឌី បានស្កេនវត្តមានយឺត ២២នាទី (វេនរសៀល) តាមរយៈ macOS - Chrome។ ទីតាំង GPS: 11.5512, 104.9356',
    timestamp: '2026-07-12 02:22 PM',
    read: false,
    severity: 'warning',
  },
  {
    id: 'M-003',
    title: 'ចាប់ផ្ដើមវេនសិក្សាព្រឹក',
    message: 'ប្រព័ន្ធបានចាប់ផ្ដើមតាមដានវត្តមានសម្រាប់ វេនព្រឹក (08:00 AM - 11:00 AM) រួចរាល់។',
    timestamp: '2026-07-12 08:00 AM',
    read: true,
    severity: 'info',
  },
];
