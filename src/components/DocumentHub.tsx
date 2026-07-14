import React, { useState, FormEvent } from 'react';
import * as XLSX from 'xlsx';
import { WorkshopDocument, DocumentType, OfficeFileType } from '../types';
import { 
  FileText, FolderOpen, Image, GraduationCap, FileSpreadsheet, FileSliders, 
  ExternalLink, Upload, Plus, Trash2, Search, Sparkles, Download, Check,
  Folder, MapPin, Calendar, ChevronRight, PlusCircle, User, Users, CheckCircle2,
  AlertTriangle, Info, Clock, CheckCircle, AlertCircle, FileCheck, RefreshCw, X
} from 'lucide-react';

interface DocumentHubProps {
  documents: WorkshopDocument[];
  onAddDocument: (doc: WorkshopDocument) => void;
  onDeleteDocument: (id: string) => void;
  currentUser?: any;
}

// Structuring Workshop Folder model based on user requirements
interface MissionDocument {
  id: string;
  title: string;
  isRequired: boolean;
  status: 'completed' | 'in_progress' | 'missing';
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
}

interface WorkshopFolder {
  id: string;
  title: string;
  locationProvince: string;
  date: string;
  documents: MissionDocument[];
  personnel: {
    chairman: string[];       // ប្រធានអង្គសិក្ខាសាលា
    speakers: string[];       // វាគ្មិន ឬអ្នកធ្វើបទបង្ហាញ
    facilitators: string[];   // អ្នកសម្របសម្រួល (Facilitator/Moderator)
    rapporteurs: string[];    // អ្នកកត់ត្រា (Rapporteur/Secretary)
    participants: string[];   // សិក្ខាកាម (Participants)
    committee: string[];      // គណៈកម្មការរៀបចំ
    honoredGuests: string[];  // ភ្ញៀវកិត្តិយស (បើមាន)
    // Optional/additional roles
    ministryReps: string[];   // តំណាងក្រសួង ឬអង្គភាពពាក់ព័ន្ធ
    devPartners: string[];    // ដៃគូអភិវឌ្ឍន៍
    translators: string[];     // អ្នកបកប្រែ
    techTeam: string[];       // ក្រុមបច្ចេកទេស (សំឡេង រូបភាព និង IT)
  };
}

// Initial seeded Cambodian Workshop Folders
const INITIAL_WORKSHOP_FOLDERS: WorkshopFolder[] = [
  {
    id: 'folder-1',
    title: 'សិក្ខាសាលាស្តីពី៖ "ការរៀបចំផែនការយុទ្ធសាស្ត្រឌីជីថលសម្រាប់សាលារៀនជំនាន់ថ្មី (NGS)"',
    locationProvince: 'ក្រុងព្រះសីហនុ ខេត្តព្រះសីហនុ',
    date: '2026-07-20',
    documents: [
      { id: 'm-doc-1', title: 'លិខិតបញ្ជាបេសកកម្ម (Mission Order)', isRequired: true, status: 'completed', fileName: 'mission_order_digital_plan_signed.pdf', fileSize: '1.2 MB', uploadedAt: '2026-07-12 09:30 AM' },
      { id: 'm-doc-2', title: 'លិខិតអនុញ្ញាតធ្វើដំណើរ (បើមាន)', isRequired: false, status: 'completed', fileName: 'travel_permit_shv_approved.pdf', fileSize: '850 KB', uploadedAt: '2026-07-12 09:35 AM' },
      { id: 'm-doc-3', title: 'របាយការណ៍បេសកកម្ម', isRequired: true, status: 'in_progress', fileName: 'draft_mission_report_shv.docx', fileSize: '1.4 MB', uploadedAt: '2026-07-13 10:10 AM' },
      { id: 'm-doc-4', title: 'ពាក្យស្នើសុំទូទាត់បេសកកម្ម', isRequired: true, status: 'missing' },
      { id: 'm-doc-5', title: 'តារាងគណនាប្រាក់បេសកកម្ម (ប្រាក់ហោប៉ៅ ប្រាក់ស្នាក់នៅ ប្រាក់ធ្វើដំណើរ ជាដើម)', isRequired: true, status: 'completed', fileName: 'mission_allowance_calculator_v1.xlsx', fileSize: '420 KB', uploadedAt: '2026-07-13 10:15 AM' },
      { id: 'm-doc-6', title: 'វិក្កយបត្រ ឬបង្កាន់ដៃពាក់ព័ន្ធ (សណ្ឋាគារ សំបុត្រធ្វើដំណើរ ប្រេងឥន្ធនៈ ជាដើម ប្រសិនបើតម្រូវ)', isRequired: false, status: 'completed', fileName: 'hotel_invoice_sihanoukville_resort.pdf', fileSize: '2.4 MB', uploadedAt: '2026-07-13 10:20 AM' },
      { id: 'm-doc-7', title: 'បញ្ជីហត្ថលេខាអ្នកចូលរួម (ប្រសិនបើជាការប្រជុំ ឬវគ្គបណ្តុះបណ្តាល)', isRequired: true, status: 'completed', fileName: 'participants_signatures_day1_day2.pdf', fileSize: '3.8 MB', uploadedAt: '2026-07-12 04:50 PM' },
      { id: 'm-doc-8', title: 'ឯកសារបញ្ជាក់ការចូលរួម (បើមាន)', isRequired: false, status: 'missing' },
      { id: 'm-doc-9', title: 'ព័ត៌មានគណនីធនាគារ ឬឯកសារទូទាត់ផ្សេងៗ តាមការកំណត់របស់អង្គភាព', isRequired: true, status: 'completed', fileName: 'aba_bank_details_team_reimbursement.pdf', fileSize: '540 KB', uploadedAt: '2026-07-12 10:00 AM' },
    ],
    personnel: {
      chairman: ['ឯកឧត្តមបណ្ឌិត សាន វឌ្ឍនា (ប្រធានក្រុមប្រឹក្សាភិបាល)'],
      speakers: ['លោកគ្រូ ចាន់ ណារ៉ុង (អ្នកជំនាញ IT)', 'អ្នកគ្រូ លី ដាណេ (អ្នកឯកទេសកម្មវិធីសិក្សា)'],
      facilitators: ['លោក ងួន សុភ័ក្ត្រ (សម្របសម្រួលសាលប្រជុំ)', 'កញ្ញា ចាន់ សូភី (ចុះឈ្មោះ និងពិធីការ)'],
      rapporteurs: ['លោក សុខ ដារ៉ា (អ្នកកត់ត្រាខ្លឹមសារសិក្ខាសាលា)'],
      participants: ['លោកនាយក-នាយិកាសាលា NGS ចំនួន ២០រូប', 'លោកគ្រូ-អ្នកគ្រូបច្ចេកវិទ្យា ចំនួន ១៥រូប'],
      committee: ['លោកស្រី ម៉ៅ សុខា (ផ្នែកភស្តុភារ)', 'លោក ហេង វ៉ាន់ឌី (ផ្នែករដ្ឋបាល និងហិរញ្ញវត្ថុ)'],
      honoredGuests: ['លោកប្រធានមន្ទីរអប់រំ យុវជន និងកីឡា ខេត្តព្រះសីហនុ'],
      ministryReps: ['តំណាងនាយកដ្ឋានអប់រំមធ្យមសិក្សាបច្ចេកវិទ្យា នៃក្រសួងអប់រំ'],
      devPartners: ['តំណាងអង្គការ USAID', 'តំណាងវិស័យឯកជន (Smart Axiata)'],
      translators: ['កញ្ញា សុខ ម៉ារីយ៉ា (បកប្រែអង់គ្លេស-ខ្មែរ សម្រាប់វាគ្មិនកិត្តិយសបរទេស)'],
      techTeam: ['លោក មាស សំណាង (គ្រប់គ្រងប្រព័ន្ធសំឡេង និងឧបករណ៍ IT)'],
    }
  },
  {
    id: 'folder-2',
    title: 'វគ្គបណ្តុះបណ្តាលស្តីពី៖ "បច្ចេកវិទ្យា GPS និងការគ្រប់គ្រងវត្តមានឆ្លាតវៃក្នុងសតវត្សទី២១"',
    locationProvince: 'ខណ្ឌទួលគោក រាជធានីភ្នំពេញ (វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា - ITC)',
    date: '2026-07-13',
    documents: [
      { id: 'm-doc-1', title: 'លិខិតបញ្ជាបេសកកម្ម (Mission Order)', isRequired: true, status: 'completed', fileName: 'mission_order_gps_training_phnom_penh.pdf', fileSize: '1.5 MB', uploadedAt: '2026-07-11 08:30 AM' },
      { id: 'm-doc-2', title: 'លិខិតអនុញ្ញាតធ្វើដំណើរ (បើមាន)', isRequired: false, status: 'missing' },
      { id: 'm-doc-3', title: 'របាយការណ៍បេសកកម្ម', isRequired: true, status: 'completed', fileName: 'gps_workshop_summary_report.docx', fileSize: '1.8 MB', uploadedAt: '2026-07-13 03:00 PM' },
      { id: 'm-doc-4', title: 'ពាក្យស្នើសុំទូទាត់បេសកកម្ម', isRequired: true, status: 'completed', fileName: 'payment_claim_form_0713.pdf', fileSize: '620 KB', uploadedAt: '2026-07-13 04:10 PM' },
      { id: 'm-doc-5', title: 'តារាងគណនាប្រាក់បេសកកម្ម (ប្រាក់ហោប៉ៅ ប្រាក់ស្នាក់នៅ ប្រាក់ធ្វើដំណើរ ជាដើម)', isRequired: true, status: 'completed', fileName: 'reimbursement_calculation_sheet.xlsx', fileSize: '250 KB', uploadedAt: '2026-07-13 11:20 AM' },
      { id: 'm-doc-6', title: 'វិក្កយបត្រ ឬបង្កាន់ដៃពាក់ព័ន្ធ (សណ្ឋាគារ សំបុត្រធ្វើដំណើរ ប្រេងឥន្ធនៈ ជាដើម ប្រសិនបើតម្រូវ)', isRequired: false, status: 'completed', fileName: 'fuel_receipts_caltex_itc.pdf', fileSize: '1.1 MB', uploadedAt: '2026-07-13 05:00 PM' },
      { id: 'm-doc-7', title: 'បញ្ជីហត្ថលេខាអ្នកចូលរួម (ប្រសិនបើជាការប្រជុំ ឬវគ្គបណ្តុះបណ្តាល)', isRequired: true, status: 'completed', fileName: 'itc_attendees_signature_sheet.pdf', fileSize: '4.2 MB', uploadedAt: '2026-07-13 01:30 PM' },
      { id: 'm-doc-8', title: 'ឯកសារបញ្ជាក់ការចូលរួម (បើមាន)', isRequired: false, status: 'completed', fileName: 'certificate_of_participation_samples.pdf', fileSize: '3.1 MB', uploadedAt: '2026-07-13 05:30 PM' },
      { id: 'm-doc-9', title: 'ព័ត៌មានគណនីធនាគារ ឬឯកសារទូទាត់ផ្សេងៗ តាមការកំណត់របស់អង្គភាព', isRequired: true, status: 'completed', fileName: 'bank_card_and_identity_docs_combined.pdf', fileSize: '980 KB', uploadedAt: '2026-07-11 09:15 AM' },
    ],
    personnel: {
      chairman: ['លោកជំទាវ គង់ សូរីយ៉ា (អនុរដ្ឋលេខាធិការ ក្រសួងព័ត៌មានវិទ្យា)'],
      speakers: ['លោក ហេង វ៉ាន់ឌី (ប្រធានផ្នែកអភិវឌ្ឍន៍បច្ចេកវិទ្យាប្រព័ន្ធ GPS)'],
      facilitators: ['កញ្ញា កែវ ផល្លា (សម្របសម្រួលបច្ចេកទេស និងចុះឈ្មោះ)'],
      rapporteurs: ['លោក សុខ ដារ៉ា (លេខាកត់ត្រាសេចក្តីសម្រេច)'],
      participants: ['សិក្ខាកាមមកពីសាលាគរុកោសល្យភូមិភាគ និងគ្រូបណ្តុះបណ្តាល ចំនួន ៤០រូប'],
      committee: ['ក្រុមការងារលេខាធិការដ្ឋាន IT នាយកដ្ឋានគាំទ្រគម្រោង'],
      honoredGuests: ['ឯកឧត្តមបណ្ឌិត តំណាងជាន់ខ្ពស់ក្រសួងអប់រំ យុវជន និងកីឡា'],
      ministryReps: ['មន្ត្រីនាយកដ្ឋានព័ត៌មានវិទ្យា ក្រសួងមហាផ្ទៃ ចំនួន ២រូប'],
      devPartners: ['តំណាងដៃគូអភិវឌ្ឍន៍ JICA (ទីភ្នាក់ងារសហប្រតិបត្តិការអន្តរជាតិជប៉ុន)'],
      translators: [],
      techTeam: ['ក្រុមអ្នកបច្ចេកទេសប្រព័ន្ធ IT និងបណ្តាញណេតវើក'],
    }
  }
];

export default function DocumentHub({ documents, onAddDocument, onDeleteDocument, currentUser }: DocumentHubProps) {
  // Main Hub Mode: Folder Manager vs Shared Assets Library
  const [hubMode, setHubMode] = useState<'folders' | 'shared_library'>('folders');
  
  // Workshop Folders State
  const [folders, setFolders] = useState<WorkshopFolder[]>(INITIAL_WORKSHOP_FOLDERS);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('folder-1');
  const [folderDetailTab, setFolderDetailTab] = useState<'docs' | 'personnel'>('docs');
  
  // Create New Workshop Folder Form State
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderTitle, setNewFolderTitle] = useState('');
  const [newFolderProvince, setNewFolderProvince] = useState('រាជធានីភ្នំពេញ');
  const [newFolderDate, setNewFolderDate] = useState(new Date().toISOString().split('T')[0]);

  // Upload/Attach file simulation state
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [simulatedDragActive, setSimulatedDragActive] = useState(false);
  const [simulatedFileName, setSimulatedFileName] = useState('');
  const [simulatedFileSize, setSimulatedFileSize] = useState('');
  const [isUploadingProgress, setIsUploadingProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Personnel inline editor states
  const [editingPersonnelRole, setEditingPersonnelRole] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState('');

  // Search in folders
  const [folderSearch, setFolderSearch] = useState('');

  // ----------------------------------------------------
  // ORIGINAL DOCUMENT LIBRARY STATE & WORKFLOWS
  // ----------------------------------------------------
  const [activeTab, setActiveTab] = useState<DocumentType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload photo form state
  const [isUploading, setIsUploading] = useState(false);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoDesc, setPhotoDesc] = useState('');
  const [photoPresetUrl, setPhotoPresetUrl] = useState('https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800');
  const [uploadedBy, setUploadedBy] = useState('លោកគ្រូ ចាន់ ណារ៉ុង');

  // Real Local Photo Upload states and ref
  const photoFileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>('');
  const [uploadedPhotoFileName, setUploadedPhotoFileName] = useState<string>('');

  // Document preset uploads
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<DocumentType>('drive');
  const [newDocOfficeType, setNewDocOfficeType] = useState<OfficeFileType>('word');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');

  // Handle Download Excel / Word Simulation
  const handleDownloadFile = (doc: WorkshopDocument) => {
    try {
      if (doc.officeType === 'excel') {
        const wsData = [
          ['ប្រព័ន្ធគ្រប់គ្រងវត្តមានសិក្ខាសាលា (Workshop Attendance Management System)'],
          ['ឈ្មោះឯកសារ / Document:', doc.title],
          ['ការពិពណ៌នា / Desc:', doc.description || 'N/A'],
          ['អ្នករៀបចំ / Creator:', doc.uploadedBy],
          ['កាលបរិច្ឆេទ / Date:', doc.uploadedAt],
          [],
          ['ល.រ (No.)', 'អត្តលេខ (Student ID)', 'ឈ្មោះខ្មែរ (Khmer Name)', 'ឈ្មោះឡាតាំង (Latin Name)', 'ភេទ (Gender)', 'វេនសិក្សា (Shift)', 'ស្ថានភាពវត្តមាន (Status)'],
          ['1', 'ST-2026-001', 'សុខ មិនា', 'Sok Meana', 'ប្រុស', 'Morning', 'Present'],
          ['2', 'ST-2026-002', 'ចាន់ ស្រីនី', 'Chan Sreyny', 'ស្រី', 'Morning', 'Present'],
          ['3', 'ST-2026-003', 'កែវ សុភ័ក្រ', 'Keo Sopheak', 'ប្រុស', 'Afternoon', 'Late'],
          ['4', 'ST-2026-004', 'ម៉ៅ វីរៈ', 'Mao Virak', 'ប្រុស', 'Afternoon', 'Present']
        ];
        
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Workshop Data');
        XLSX.writeFile(wb, `${doc.title.replace(/\s+/g, '_') || 'workshop_template'}.xlsx`);
      } else {
        let content = `====================================================\n`;
        content += `   ឯកសារកិច្ចការសិក្ខាសាលា / WORKSHOP WORKPLAN DOCUMENT\n`;
        content += `====================================================\n\n`;
        content += `ចំណងជើង (Title): ${doc.title}\n`;
        content += `ប្រភេទ (Type): ${doc.officeType === 'word' ? 'Microsoft Word (.docx)' : 'Microsoft PowerPoint (.pptx)'}\n`;
        content += `ការពិពណ៌នា (Description): ${doc.description || 'N/A'}\n`;
        content += `អ្នករៀបចំ (Uploaded By): ${doc.uploadedBy}\n`;
        content += `កាលបរិច្ឆេទ (Uploaded At): ${doc.uploadedAt}\n\n`;
        content += `----------------------------------------------------\n`;
        content += `កាលវិភាគស្កេនវត្តមានទាំង ៤វគ្គ (Workshop 4 Attendance Sessions):\n`;
        content += `----------------------------------------------------\n`;
        content += `១. វគ្គចូល-ព្រឹក (Morning Check-In): 07:30 AM - 08:00 AM\n`;
        content += `២. វគ្គចេញ-ព្រឹក (Morning Check-Out): 11:20 AM - 11:50 AM\n`;
        content += `៣. វគ្គចូល-រសៀល (Afternoon Check-In): 01:30 PM - 02:00 PM\n`;
        content += `៤. វគ្គចេញ-រសៀល (Afternoon Check-Out): 05:00 PM - 05:30 PM\n\n`;
        content += `សេចក្តីណែនាំសម្រាប់ការស្កេនវត្តមាន៖\n`;
        content += `- សិក្ខាកាមទាំងអស់ត្រូវស្ថិតនៅក្នុងរង្វង់ ១០ ម៉ែត្រជុំវិញទីតាំងសិក្ខាសាលាដើម្បីអាចស្កេនបាន។\n`;
        content += `- ប្រព័ន្ធ GPS នឹងផ្ទៀងផ្ទាត់ដោយស្វ័យប្រវត្តិ។\n\n`;
        content += `ឯកសារបង្កើតឡើងដោយស្វ័យប្រវត្តិចេញពី៖ ប្រព័ន្ធគ្រប់គ្រងវត្តមានសិក្ខាសាលា (Cambodia Workshop GPS Attendance App)\n`;
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = doc.officeType === 'word' ? 'docx' : 'pptx';
        a.download = `${doc.title.replace(/\s+/g, '_') || 'workshop_assignment'}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error(e);
      alert('ការទាញយកឯកសារមានកំហុស៖ ' + e);
    }
  };

  const handleUploadPhoto = (e: FormEvent) => {
    e.preventDefault();
    if (!photoTitle) return;

    const finalPhotoUrl = uploadedPhotoUrl || photoPresetUrl;

    const newDoc: WorkshopDocument = {
      id: `D-${Date.now()}`,
      title: photoTitle,
      type: 'photo',
      category: 'រូបភាពសកម្មភាព',
      url: finalPhotoUrl,
      thumbnailUrl: finalPhotoUrl,
      uploadedBy,
      uploadedAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) + ' ' + new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      fileSize: '1.5 MB',
      description: photoDesc,
    };

    onAddDocument(newDoc);
    setPhotoTitle('');
    setPhotoDesc('');
    setUploadedPhotoUrl('');
    setUploadedPhotoFileName('');
    setIsUploading(false);
  };

  const handleCreateDocument = (e: FormEvent) => {
    e.preventDefault();
    if (!newDocTitle) return;

    let category = 'Google Drive';
    if (newDocType === 'classroom') category = 'Google Classroom';
    else if (newDocType === 'doc') category = 'Google Doc';
    else if (newDocType === 'office') category = 'Microsoft Office';

    const newDoc: WorkshopDocument = {
      id: `D-${Date.now()}`,
      title: newDocTitle,
      type: newDocType,
      category,
      url: newDocUrl || 'https://google.com',
      uploadedBy: 'លោកគ្រូ ចាន់ ណារ៉ុង',
      uploadedAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) + ' ' + new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      fileSize: newDocType === 'office' ? '380 KB' : undefined,
      description: newDocDesc,
      officeType: newDocType === 'office' ? newDocOfficeType : undefined,
    };

    onAddDocument(newDoc);
    setNewDocTitle('');
    setNewDocDesc('');
    setNewDocUrl('');
    setIsAddingDoc(false);
  };

  const filteredDocs = documents.filter(doc => {
    const matchesTab = activeTab === 'all' || doc.type === activeTab;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getDocIcon = (doc: WorkshopDocument) => {
    switch (doc.type) {
      case 'photo':
        return <Image className="h-5 w-5 text-indigo-500" />;
      case 'drive':
        return <FolderOpen className="h-5 w-5 text-amber-500" />;
      case 'classroom':
        return <GraduationCap className="h-5 w-5 text-emerald-600" />;
      case 'doc':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'office':
        if (doc.officeType === 'word') return <FileText className="h-5 w-5 text-sky-600" />;
        if (doc.officeType === 'excel') return <FileSpreadsheet className="h-5 w-5 text-emerald-600" />;
        if (doc.officeType === 'powerpoint') return <FileSliders className="h-5 w-5 text-orange-500" />;
        return <FileText className="h-5 w-5 text-slate-500" />;
      default:
        return <FileText className="h-5 w-5 text-slate-500" />;
    }
  };

  const getOfficeColorClass = (type?: OfficeFileType) => {
    if (type === 'word') return 'border-sky-100 bg-sky-50 text-sky-700';
    if (type === 'excel') return 'border-emerald-100 bg-emerald-50 text-emerald-700';
    if (type === 'powerpoint') return 'border-orange-100 bg-orange-50 text-orange-700';
    return 'border-slate-100 bg-slate-50 text-slate-700';
  };

  // ----------------------------------------------------
  // WORKSHOP FOLDER MANAGEMENT ACTION HANDLERS
  // ----------------------------------------------------
  
  // Create New Folder
  const handleCreateNewFolder = (e: FormEvent) => {
    e.preventDefault();
    if (!newFolderTitle.trim()) return;

    const newFolderId = `folder-${Date.now()}`;
    const newFolder: WorkshopFolder = {
      id: newFolderId,
      title: newFolderTitle.trim(),
      locationProvince: newFolderProvince,
      date: newFolderDate,
      // Fresh, required checklist template (all 9 items as specified by user)
      documents: [
        { id: 'm-doc-1', title: 'លិខិតបញ្ជាបេសកកម្ម (Mission Order)', isRequired: true, status: 'missing' },
        { id: 'm-doc-2', title: 'លិខិតអនុញ្ញាតធ្វើដំណើរ (បើមាន)', isRequired: false, status: 'missing' },
        { id: 'm-doc-3', title: 'របាយការណ៍បេសកកម្ម', isRequired: true, status: 'missing' },
        { id: 'm-doc-4', title: 'ពាក្យស្នើសុំទូទាត់បេសកកម្ម', isRequired: true, status: 'missing' },
        { id: 'm-doc-5', title: 'តារាងគណនាប្រាក់បេសកកម្ម (ប្រាក់ហោប៉ៅ ប្រាក់ស្នាក់នៅ ប្រាក់ធ្វើដំណើរ ជាដើម)', isRequired: true, status: 'missing' },
        { id: 'm-doc-6', title: 'វិក្កយបត្រ ឬបង្កាន់ដៃពាក់ព័ន្ធ (សណ្ឋាគារ សំបុត្រធ្វើដំណើរ ប្រេងឥន្ធនៈ ជាដើម ប្រសិនបើតម្រូវ)', isRequired: false, status: 'missing' },
        { id: 'm-doc-7', title: 'បញ្ជីហត្ថលេខាអ្នកចូលរួម (ប្រសិនបើជាការប្រជុំ ឬវគ្គបណ្តុះបណ្តាល)', isRequired: true, status: 'missing' },
        { id: 'm-doc-8', title: 'ឯកសារបញ្ជាក់ការចូលរួម (បើមាន)', isRequired: false, status: 'missing' },
        { id: 'm-doc-9', title: 'ព័ត៌មានគណនីធនាគារ ឬឯកសារទូទាត់ផ្សេងៗ តាមការកំណត់របស់អង្គភាព', isRequired: true, status: 'missing' },
      ],
      // Fresh empty personnel structure
      personnel: {
        chairman: [],
        speakers: [],
        facilitators: [],
        rapporteurs: [],
        participants: [],
        committee: [],
        honoredGuests: [],
        ministryReps: [],
        devPartners: [],
        translators: [],
        techTeam: []
      }
    };

    setFolders([newFolder, ...folders]);
    setSelectedFolderId(newFolderId);
    setNewFolderTitle('');
    setShowCreateFolderModal(false);
  };

  // Delete Workshop Folder
  const handleDeleteFolder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('តើលោកអ្នកពិតជាចង់លុបថតឯកសារសិក្ខាសាលានេះមែនទេ?')) {
      const remaining = folders.filter(f => f.id !== id);
      setFolders(remaining);
      if (selectedFolderId === id && remaining.length > 0) {
        setSelectedFolderId(remaining[0].id);
      }
    }
  };

  // Toggle document status manually
  const handleToggleDocStatus = (folderId: string, docId: string, nextStatus: 'completed' | 'in_progress' | 'missing') => {
    setFolders(folders.map(f => {
      if (f.id === folderId) {
        return {
          ...f,
          documents: f.documents.map(d => {
            if (d.id === docId) {
              return { 
                ...d, 
                status: nextStatus,
                // if reset to missing, clear attachment
                fileName: nextStatus === 'missing' ? undefined : d.fileName,
                fileSize: nextStatus === 'missing' ? undefined : d.fileSize,
                uploadedAt: nextStatus === 'missing' ? undefined : d.uploadedAt
              };
            }
            return d;
          })
        };
      }
      return f;
    }));
  };

  // Launch File Upload simulation for a document
  const openUploadSimulation = (docId: string) => {
    setUploadingDocId(docId);
    setSimulatedFileName('');
    setSimulatedFileSize('');
    setUploadProgress(0);
    setIsUploadingProgress(false);
  };

  // Handle actual file select from the input file element
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSimulatedFileName(file.name);
      setSimulatedFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    }
  };

  // Confirm Simulated upload
  const handleSimulateAttachFile = () => {
    if (!uploadingDocId) return;
    
    setIsUploadingProgress(true);
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        // Save attached file to folder documents
        setFolders(folders.map(f => {
          if (f.id === selectedFolderId) {
            return {
              ...f,
              documents: f.documents.map(d => {
                if (d.id === uploadingDocId) {
                  const finalName = simulatedFileName.trim() || `${d.title.split(' ')[0].toLowerCase()}_draft_${new Date().getDate()}.pdf`;
                  return {
                    ...d,
                    status: 'completed',
                    fileName: finalName.endsWith('.pdf') || finalName.endsWith('.docx') || finalName.endsWith('.xlsx') ? finalName : `${finalName}.pdf`,
                    fileSize: simulatedFileSize || `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
                    uploadedAt: new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) + ' ' + new Date().toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })
                  };
                }
                return d;
              })
            };
          }
          return f;
        }));

        setIsUploadingProgress(false);
        setUploadingDocId(null);
      }
    }, 150);
  };

  // Remove attached file
  const handleRemoveAttachedFile = (folderId: string, docId: string) => {
    setFolders(folders.map(f => {
      if (f.id === folderId) {
        return {
          ...f,
          documents: f.documents.map(d => {
            if (d.id === docId) {
              return {
                ...d,
                status: 'missing',
                fileName: undefined,
                fileSize: undefined,
                uploadedAt: undefined
              };
            }
            return d;
          })
        };
      }
      return f;
    }));
  };

  // Manage personnel additions/removals
  const handleAddPersonnelName = (roleKey: string) => {
    if (!newMemberName.trim()) return;
    
    setFolders(folders.map(f => {
      if (f.id === selectedFolderId) {
        const personnelCopy = { ...f.personnel } as any;
        personnelCopy[roleKey] = [...(personnelCopy[roleKey] || []), newMemberName.trim()];
        return {
          ...f,
          personnel: personnelCopy
        };
      }
      return f;
    }));

    setNewMemberName('');
    setEditingPersonnelRole(null);
  };

  const handleRemovePersonnelName = (roleKey: string, index: number) => {
    setFolders(folders.map(f => {
      if (f.id === selectedFolderId) {
        const personnelCopy = { ...f.personnel } as any;
        personnelCopy[roleKey] = personnelCopy[roleKey].filter((_: any, i: number) => i !== index);
        return {
          ...f,
          personnel: personnelCopy
        };
      }
      return f;
    }));
  };

  // Find active selected folder
  const activeFolder = folders.find(f => f.id === selectedFolderId) || folders[0];

  // Calculate completion percentage of required documents
  const getFolderCompletionPercent = (folder: WorkshopFolder) => {
    const requiredDocs = folder.documents.filter(d => d.isRequired);
    if (requiredDocs.length === 0) return 100;
    const completedRequired = requiredDocs.filter(d => d.status === 'completed').length;
    return Math.round((completedRequired / requiredDocs.length) * 100);
  };

  // Translate roles display to Khmer
  const getRoleKhmerName = (roleKey: string) => {
    switch (roleKey) {
      case 'chairman': return 'ប្រធានអង្គសិក្ខាសាលា';
      case 'speakers': return 'វាគ្មិន ឬអ្នកធ្វើបទបង្ហាញ';
      case 'facilitators': return 'អ្នកសម្របសម្រួល (Facilitator/Moderator)';
      case 'rapporteurs': return 'អ្នកកត់ត្រា (Rapporteur/Secretary)';
      case 'participants': return 'សិក្ខាកាម (Participants)';
      case 'committee': return 'គណៈកម្មការរៀបចំ';
      case 'honoredGuests': return 'ភ្ញៀវកិត្តិយស';
      case 'ministryReps': return 'តំណាងក្រសួង ឬអង្គភាពពាក់ព័ន្ធ';
      case 'devPartners': return 'ដៃគូអភិវឌ្ឍន៍';
      case 'translators': return 'អ្នកបកប្រែ (បើមានភាសាបរទេស)';
      case 'techTeam': return 'ក្រុមបច្ចេកទេស (សំឡេង រូបភាព និង IT)';
      default: return roleKey;
    }
  };

  const getRoleDescription = (roleKey: string) => {
    switch (roleKey) {
      case 'chairman': return 'ដឹកនាំ និងគ្រប់គ្រងដំណើរការសិក្ខាសាលាទូទៅ។';
      case 'speakers': return 'បង្ហាញប្រធានបទ ឬចែករំលែកចំណេះដឹង និងធ្វើបទបង្ហាញ។';
      case 'facilitators': return 'សម្របសម្រួលការពិភាក្សា សំណួរចម្លើយ និងការចូលរួមរបស់សិក្ខាកាម។';
      case 'rapporteurs': return 'កត់ត្រាខ្លឹមសារសំខាន់ៗ សេចក្តីសម្រេច និងអនុសាសន៍ទាំងអស់។';
      case 'participants': return 'អ្នកចូលរួមស្តាប់ ពិភាក្សា និងផ្តល់មតិយោបល់ផ្ទាល់។';
      case 'committee': return 'ទទួលខុសត្រូវផ្នែករដ្ឋបាល ភស្តុភារ ការចុះឈ្មោះ និងការរៀបចំទីកន្លែង។';
      case 'honoredGuests': return 'ថ្នាក់ដឹកនាំ ឬតំណាងស្ថាប័នជាន់ខ្ពស់ដែលអញ្ជើញចូលរួមជាអធិបតី។';
      case 'ministryReps': return 'តំណាងក្រសួងពាក់ព័ន្ធ ដែលចូលរួមសហការ ឬផ្តល់អនុសាសន៍។';
      case 'devPartners': return 'អង្គការដៃគូអភិវឌ្ឍន៍ជាតិ ឬអន្តរជាតិដែលជួយឧបត្ថម្ភគាំទ្រ។';
      case 'translators': return 'ជួយបកប្រែភាសាបន្តផ្ទាល់ជូនគណៈអធិបតី និងវាគ្មិនបរទេស។';
      case 'techTeam': return 'គ្រប់គ្រងម៉ាស៊ីនស្លាយ ឧបករណ៍បំពងសំឡេង ថតរូប និងជំនួយការ IT។';
      default: return '';
    }
  };

  // List of Cambodian Province Options for New Folder Form
  const PROVINCES = [
    'រាជធានីភ្នំពេញ',
    'ខេត្តព្រះសីហនុ',
    'ខេត្តសៀមរាប',
    'ខេត្តបាត់ដំបង',
    'ខេត្តកំពត',
    'ខេត្តកែប',
    'ខេត្តកណ្តាល',
    'ខេត្តកំពង់ចាម',
    'ខេត្តកំពង់ឆ្នាំង',
    'ខេត្តកំពង់ធំ',
    'ខេត្តកំពង់ស្ពឺ',
    'ខេត្តកោះកុង',
    'ខេត្តក្រចេះ',
    'ខេត្តពោធិ៍សាត់',
    'ខេត្តព្រះវិហារ',
    'ខេត្តព្រៃវែង',
    'ខេត្តតាកែវ',
    'ខេត្តស្វាយរៀង',
    'ខេត្តមណ្ឌលគិរី',
    'ខេត្តរតនគិរី',
    'ខេត្តស្ទឹងត្រែង',
    'ខេត្តបន្ទាយមានជ័យ',
    'ខេត្តប៉ៃលិន',
    'ខេត្តឧត្តរមានជ័យ'
  ];

  return (
    <div className="space-y-6">
      
      {/* Upper Mode Switcher Navigation (Folders vs Shared Assets) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
              <FolderOpen className="h-5 w-5" />
            </span>
            <h2 className="text-base font-bold font-sans text-slate-100 tracking-wide">គ្រប់គ្រងថតឯកសារសិក្ខាសាលា (Workshop Documents & Composition Folder)</h2>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed font-medium">លោកអ្នកអាចចាត់ចែង បង្កើតថតឯកសារទូទាត់បេសកកម្ម លំអិតទៅតាមសិក្ខាសាលានីមួយៗ និងរៀបចំសមាសភាពក្នុងអង្គពិធី។</p>
        </div>

        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setHubMode('folders')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              hubMode === 'folders'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Folder className="h-3.5 w-3.5" />
            ថតឯកសារសិក្ខាសាលា ({folders.length})
          </button>
          
          <button
            onClick={() => setHubMode('shared_library')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              hubMode === 'shared_library'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            បណ្ណាល័យឯកសាររួម ({documents.length})
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------
          VIEW 1: WORKSHOP FOLDER MANAGER (PRIMARY USER REQUEST)
          ---------------------------------------------------- */}
      {hubMode === 'folders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Folders Navigation & Creation (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-xs tracking-wider uppercase">ថតឯកសារទាំងអស់ (FOLDERS)</h3>
                <button
                  onClick={() => setShowCreateFolderModal(true)}
                  className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  បង្កើតថ្មី
                </button>
              </div>

              {/* Folder Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ស្វែងរកឈ្មោះសិក្ខាសាលា..."
                  value={folderSearch}
                  onChange={(e) => setFolderSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Folder Cards List */}
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {folders
                  .filter(f => f.title.toLowerCase().includes(folderSearch.toLowerCase()) || f.locationProvince.toLowerCase().includes(folderSearch.toLowerCase()))
                  .map(f => {
                    const isSelected = f.id === selectedFolderId;
                    const completionPercent = getFolderCompletionPercent(f);
                    const completedCount = f.documents.filter(d => d.isRequired && d.status === 'completed').length;
                    const totalRequired = f.documents.filter(d => d.isRequired).length;

                    return (
                      <div
                        key={f.id}
                        onClick={() => setSelectedFolderId(f.id)}
                        className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer text-left relative group ${
                          isSelected
                            ? 'bg-blue-50/50 border-blue-200/80 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-100'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`p-2 rounded-lg shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                          }`}>
                            <Folder className="h-4.5 w-4.5" />
                          </div>
                          
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <h4 className="font-bold text-xs text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-800 transition">
                              {f.title}
                            </h4>
                            
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-slate-500 font-medium">
                              <span className="flex items-center gap-0.5">
                                <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[140px]">{f.locationProvince}</span>
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                                {f.date}
                              </span>
                            </div>

                            {/* Checklist Progress Bar */}
                            <div className="space-y-1 pt-1.5">
                              <div className="flex justify-between items-center text-[9px] font-bold">
                                <span className="text-slate-500">ឯកសារទូទាត់៖</span>
                                <span className={completionPercent === 100 ? 'text-emerald-600' : 'text-slate-600'}>
                                  {completedCount}/{totalRequired} ({completionPercent}%)
                                </span>
                              </div>
                              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-300 ${
                                    completionPercent === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${completionPercent}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Delete folder button (always visible to support mobile/touch screens) */}
                        <button
                          onClick={(e) => handleDeleteFolder(f.id, e)}
                          className="absolute top-2 right-2 p-1.5 text-red-500 hover:text-red-700 bg-red-50/95 rounded-lg hover:bg-red-100 border border-red-100/50 transition duration-150 shadow-xs z-10"
                          title="លុបថតនេះ"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Visual Guideline Box */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-blue-600" />
                សេចក្តីណែនាំអំពីឯកសារបេសកកម្ម
              </h4>
              <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                ដើម្បីអាចស្នើសុំទូទាត់ថវិកាបេសកកម្មសិក្ខាសាលាបាន លោកអ្នកត្រូវប្រាកដថា ឯកសារបង្គោលជាកាតព្វកិច្ច (លិខិតបញ្ជា, របាយការណ៍បេសកកម្ម, តារាងគណនា, ពាក្យស្នើសុំ និងបញ្ជីវត្តមាន) ត្រូវបានបំពេញរួចរាល់ ១០០%។
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Folder Contents (Documents & Personnel) (8 cols) */}
          <div className="lg:col-span-8">
            {activeFolder ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                
                {/* Active Folder Header Banner */}
                <div className="bg-slate-50 border-b border-slate-100 p-5 space-y-3.5 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                      <Folder className="h-3 w-3" />
                      FOLDER ACTIVE
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      {activeFolder.locationProvince}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-500" />
                      កាលបរិច្ឆេទ៖ {activeFolder.date}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-base leading-snug">
                    {activeFolder.title}
                  </h3>

                  {/* Folder Detail Sub Tabs Switcher */}
                  <div className="flex gap-2 border-t border-slate-200/60 pt-3">
                    <button
                      onClick={() => setFolderDetailTab('docs')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        folderDetailTab === 'docs'
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      📁 ឯកសារទូទាត់បេសកកម្ម ({activeFolder.documents.filter(d => d.status === 'completed').length}/{activeFolder.documents.length})
                    </button>
                    
                    <button
                      onClick={() => setFolderDetailTab('personnel')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        folderDetailTab === 'personnel'
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Users className="h-3.5 w-3.5" />
                      👥 សមាសភាព និងតួនាទី ({Object.values(activeFolder.personnel).flat().length} នាក់)
                    </button>
                  </div>
                </div>

                {/* Sub Tab View 1: Mission Settlement Documents Checklist */}
                {folderDetailTab === 'docs' && (
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-center bg-amber-50 border border-amber-200/50 p-3 rounded-xl">
                      <div className="flex gap-2 items-start text-left">
                        <Sparkles className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <p className="font-bold text-amber-950 text-xs">ឯកសារតម្រូវសម្រាប់ការទូទាត់បេសកកម្ម (Settle Travel Expenses)៖</p>
                          <p className="text-amber-800 text-[10px] font-medium leading-relaxed">
                            សូមពិនិត្យស្ថានភាពឯកសារ ឬចុចប៊ូតុង <strong className="text-amber-950">"ភ្ជាប់ឯកសារ"</strong> ដើម្បីបង្ហោះ ឬកែប្រែស្ថានភាពឯកសារនីមួយៗឱ្យបានត្រឹមត្រូវ។
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bulleted Document Checklist list */}
                    <div className="divide-y divide-slate-100">
                      {activeFolder.documents.map((doc, idx) => {
                        return (
                          <div key={doc.id} className="py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-left">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-500 text-xs min-w-[20px]">{idx + 1}.</span>
                                <h4 className="font-bold text-xs text-slate-800 leading-snug">
                                  {doc.title}
                                </h4>
                                {doc.isRequired ? (
                                  <span className="bg-red-50 text-red-700 text-[8px] font-bold px-1.5 py-0.2 rounded border border-red-100 shrink-0">កាតព្វកិច្ច</span>
                                ) : (
                                  <span className="bg-slate-50 text-slate-500 text-[8px] font-bold px-1.5 py-0.2 rounded border border-slate-100 shrink-0">បើមាន</span>
                                )}
                              </div>

                              {/* Attached simulated file details if available */}
                              {doc.fileName ? (
                                <div className="ml-5 flex items-center gap-2 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-100 w-fit text-[10px] font-medium">
                                  <FileCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                  <span className="font-mono">{doc.fileName}</span>
                                  <span className="text-slate-400">|</span>
                                  <span>{doc.fileSize}</span>
                                  <span className="text-slate-300">|</span>
                                  <span className="text-slate-500">បង្ហោះ៖ {doc.uploadedAt}</span>
                                </div>
                              ) : (
                                <p className="ml-5 text-[10px] text-slate-400 font-medium">មិនមានឯកសារភ្ជាប់ឡើយ</p>
                              )}
                            </div>

                            {/* Status Indicators & Upload Actions Grid */}
                            <div className="flex items-center gap-2.5 ml-5 md:ml-0 self-end md:self-center shrink-0">
                              
                              {/* Quick status cycle button */}
                              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 text-[10px] font-semibold">
                                <button
                                  onClick={() => handleToggleDocStatus(activeFolder.id, doc.id, 'completed')}
                                  className={`px-2 py-0.5 rounded ${
                                    doc.status === 'completed'
                                      ? 'bg-emerald-500 text-white font-bold shadow-xs'
                                      : 'text-slate-500 hover:text-slate-900'
                                  }`}
                                >
                                  រួចរាល់
                                </button>
                                <button
                                  onClick={() => handleToggleDocStatus(activeFolder.id, doc.id, 'in_progress')}
                                  className={`px-2 py-0.5 rounded ${
                                    doc.status === 'in_progress'
                                      ? 'bg-amber-500 text-white font-bold shadow-xs'
                                      : 'text-slate-500 hover:text-slate-900'
                                  }`}
                                >
                                  កំពុងធ្វើ
                                </button>
                                <button
                                  onClick={() => handleToggleDocStatus(activeFolder.id, doc.id, 'missing')}
                                  className={`px-2 py-0.5 rounded ${
                                    doc.status === 'missing'
                                      ? 'bg-slate-300 text-slate-700 font-bold shadow-xs'
                                      : 'text-slate-500 hover:text-slate-900'
                                  }`}
                                >
                                  ខ្វះ
                                </button>
                              </div>

                              {/* Upload/Remove Action */}
                              {doc.fileName ? (
                                <button
                                  onClick={() => handleRemoveAttachedFile(activeFolder.id, doc.id)}
                                  className="p-1.5 border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
                                  title="លុបឯកសារភ្ជាប់"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => openUploadSimulation(doc.id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
                                >
                                  <Upload className="h-3 w-3" />
                                  ភ្ជាប់ឯកសារ
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Progress Checklist Status Overview */}
                    <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
                      <div>
                        <p className="font-bold text-xs text-slate-700">ស្ថានភាពលទ្ធផលសរុប (Overall Progress)៖</p>
                        <p className="text-[10px] text-slate-400 font-medium">ថតឯកសារត្រូវបានធ្វើបច្ចុប្បន្នភាពចុងក្រោយ៖ កាលពីមុននេះបន្តិច</p>
                      </div>
                      
                      <div className="flex gap-2.5 shrink-0">
                        <button
                          onClick={() => {
                            // Reset active folder documents back to default seeded status for reset demo
                            if (confirm('តើអ្នកចង់កំណត់ឡើងវិញនូវស្ថានភាពឯកសាររបស់ថតនេះទេ?')) {
                              setFolders(folders.map(f => {
                                if (f.id === activeFolder.id) {
                                  return {
                                    ...f,
                                    documents: f.documents.map(d => ({ ...d, status: 'missing', fileName: undefined, fileSize: undefined }))
                                  };
                                }
                                return f;
                              }));
                            }
                          }}
                          className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          កំណត់ឡើងវិញ
                        </button>
                        
                        <button
                          onClick={() => {
                            alert(`ថតឯកសារ៖ "${activeFolder.title}" ត្រូវបាននាំចេញទៅកាន់ប្រព័ន្ធគ្រប់គ្រងហិរញ្ញវត្ថុដោយជោគជ័យ!`);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl flex items-center gap-1.5 transition"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          បញ្ជូនឯកសារទូទាត់បេសកកម្ម
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* Sub Tab View 2: Personnel Composition & Role Assignments */}
                {folderDetailTab === 'personnel' && (
                  <div className="p-5 space-y-5">
                    <div className="flex justify-between items-center bg-blue-50/50 border border-blue-100 p-3 rounded-xl text-left">
                      <div className="flex gap-2 items-start">
                        <Users className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <p className="font-bold text-blue-950 text-xs">គ្រប់គ្រងសមាសភាពក្នុងសិក្ខាសាលា (Workshop Personnel Composition)៖</p>
                          <p className="text-blue-800 text-[10px] font-medium leading-relaxed">
                            សូមបញ្ចូល ឬកែសម្រួលឈ្មោះសមាសភាពចូលរួមតាមតួនាទីជាក់ស្តែងនីមួយៗក្នុងសិក្ខាសាលា (មានទាំងតួនាទីស្នូល និងតួនាទីបន្ថែម)។
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Role Compositions Accordion/Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(activeFolder.personnel).map((roleKey) => {
                        const members = (activeFolder.personnel as any)[roleKey] || [];
                        const isEditingThis = editingPersonnelRole === roleKey;

                        return (
                          <div key={roleKey} className="bg-slate-50/50 rounded-xl border border-slate-150 p-4 flex flex-col justify-between space-y-3 text-left">
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-start">
                                <div className="space-y-0.5">
                                  <h4 className="font-bold text-xs text-slate-800">
                                    {getRoleKhmerName(roleKey)}
                                  </h4>
                                  <p className="text-[9.5px] text-slate-400 font-medium leading-snug">
                                    {getRoleDescription(roleKey)}
                                  </p>
                                </div>
                                <span className="bg-slate-200/80 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0">
                                  {members.length} នាក់
                                </span>
                              </div>

                              {/* Members Name Badge Lists */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {members.length === 0 ? (
                                  <span className="text-[10px] text-slate-400 italic font-medium">មិនទាន់មានសមាសភាព...</span>
                                ) : (
                                  members.map((name: string, mIdx: number) => (
                                    <span 
                                      key={mIdx} 
                                      className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-800 text-[10.5px] font-semibold px-2 py-0.5 rounded-lg shadow-2xs group/name"
                                    >
                                      {name}
                                      <button
                                        type="button"
                                        onClick={() => handleRemovePersonnelName(roleKey, mIdx)}
                                        className="text-slate-400 hover:text-red-500 shrink-0"
                                      >
                                        <X className="h-2.5 w-2.5" />
                                      </button>
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Inline Creator block */}
                            <div className="pt-2 border-t border-slate-200/40">
                              {isEditingThis ? (
                                <div className="flex gap-1">
                                  <input
                                    type="text"
                                    placeholder="បញ្ចូលឈ្មោះ..."
                                    value={newMemberName}
                                    onChange={(e) => setNewMemberName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleAddPersonnelName(roleKey);
                                    }}
                                    autoFocus
                                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-500 font-medium"
                                  />
                                  <button
                                    onClick={() => handleAddPersonnelName(roleKey)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-2.5 py-1 rounded-lg"
                                  >
                                    បន្ថែម
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingPersonnelRole(null);
                                      setNewMemberName('');
                                    }}
                                    className="bg-slate-200 text-slate-600 text-xs px-2 rounded-lg"
                                  >
                                    បិទ
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEditingPersonnelRole(roleKey)}
                                  className="text-blue-600 hover:text-blue-800 text-[10px] font-bold flex items-center gap-0.5 transition"
                                >
                                  <PlusCircle className="h-3 w-3" />
                                  កែប្រែ / បន្ថែមសមាសភាព
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                <Folder className="h-12 w-12 text-slate-300 mb-3 animate-pulse" />
                <p className="text-slate-500 font-bold text-sm">សូមជ្រើសរើស ឬបង្កើតថតឯកសារសិក្ខាសាលាដើម្បីគ្រប់គ្រង</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ----------------------------------------------------
          VIEW 2: SHARED ALL ASSETS LIBRARY (ORIGINAL FLAT LIST)
          ---------------------------------------------------- */}
      {hubMode === 'shared_library' && (
        <div className="space-y-6">
          {/* Category Selection Tabs & Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-left">
            
            {/* Tabs */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'all'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                ទាំងអស់ ({documents.length})
              </button>
              
              <button
                onClick={() => setActiveTab('photo')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'photo'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Image className="h-3.5 w-3.5" />
                រូបភាពសកម្មភាព
              </button>

              <button
                onClick={() => setActiveTab('drive')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'drive'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FolderOpen className="h-3.5 w-3.5" />
                Google Drive
              </button>

              <button
                onClick={() => setActiveTab('doc')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'doc'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Google Doc
              </button>

              <button
                onClick={() => setActiveTab('classroom')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'classroom'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                Classroom
              </button>

              <button
                onClick={() => setActiveTab('office')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'office'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Microsoft Office
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="ស្វែងរកឯកសារ ឬរូបភាព..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-xs border border-slate-100 focus:ring-2 focus:ring-slate-800 transition text-slate-850"
              />
            </div>
          </div>

          {/* Upload/Add File Floating Buttons Grid */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setIsUploading(true);
                setIsAddingDoc(false);
              }}
              className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200"
            >
              <Upload className="h-3.5 w-3.5" />
              បង្ហោះរូបភាពសកម្មភាព
            </button>
            
            <button
              onClick={() => {
                setIsAddingDoc(true);
                setIsUploading(false);
              }}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200"
            >
              <Plus className="h-3.5 w-3.5" />
              បន្ថែមតំណឯកសារសិក្ខាសាលា
            </button>
          </div>

          {/* Forms Section */}
          {isUploading && (
            <form onSubmit={handleUploadPhoto} className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-4 max-w-2xl text-left animate-fadeIn">
              <div className="flex justify-between items-center border-b border-indigo-50 pb-3">
                <h4 className="font-bold text-indigo-900 flex items-center gap-2 text-sm">
                  <Upload className="h-4 w-4" />
                  បង្ហោះរូបភាពសកម្មភាពថ្មី (រូបភាពសិក្ខាកាម)
                </h4>
                <button type="button" onClick={() => setIsUploading(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">បិទ</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">ចំណងជើងរូបភាព *</label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. សិក្ខាកាមធ្វើការអនុវត្តន៍កូដជាក្រុម"
                    value={photoTitle}
                    onChange={(e) => setPhotoTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">តំណភ្ជាប់រូបភាព (Preset Unsplash URLs)</label>
                  <select
                    value={photoPresetUrl}
                    onChange={(e) => setPhotoPresetUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 font-semibold"
                    disabled={!!uploadedPhotoUrl}
                  >
                    <option value="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800">សកម្មភាពសិក្សារួមគ្នា (Collaborative Workspace)</option>
                    <option value="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800">ការឡើងធ្វើបទបង្ហាញ (Classroom Presentation)</option>
                    <option value="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800">ការអនុវត្តផ្ទាល់លើកុំព្យូទ័រ (Coding Practice)</option>
                    <option value="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800">ការជជែកបច្ចេកវិទ្យា (Tech Seminar Group)</option>
                  </select>
                </div>
              </div>

              {/* Local File Upload Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">ឬ ជ្រើសរើសឯកសាររូបភាពពិតពីឧបករណ៍របស់អ្នក (Upload Local Photo File)</label>
                <div 
                  onClick={() => photoFileInputRef.current?.click()}
                  className="p-5 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/10 hover:bg-indigo-50/30 transition-all cursor-pointer text-center flex flex-col items-center justify-center space-y-1"
                >
                  <input 
                    type="file"
                    ref={photoFileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setUploadedPhotoFileName(file.name);
                        const reader = new FileReader();
                        reader.onload = () => {
                          setUploadedPhotoUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {uploadedPhotoUrl ? (
                    <div className="flex flex-col items-center space-y-2">
                      <img src={uploadedPhotoUrl} className="h-20 w-32 object-cover rounded-lg border border-indigo-200 shadow-xs" alt="Preview" />
                      <span className="text-[10px] font-bold text-emerald-600">បានជ្រើសរើស៖ {uploadedPhotoFileName}</span>
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedPhotoUrl('');
                          setUploadedPhotoFileName('');
                        }}
                        className="text-[9px] font-bold text-red-500 hover:underline"
                      >
                        លុបរូបភាពនេះចេញវិញ
                      </button>
                    </div>
                  ) : (
                    <>
                      <Image className="h-6 w-6 text-indigo-500 mb-1 animate-pulse" />
                      <p className="text-[11px] font-bold text-indigo-700">ចុចទីនេះ ដើម្បីជ្រើសរើស ឬអូសទម្លាក់រូបភាពសកម្មភាព</p>
                      <p className="text-[9px] text-slate-400">គាំទ្រប្រភេទ PNG, JPG, JPEG (រូបភាពពិតប្រាកដ)</p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">ការពិពណ៌នាបន្ថែម</label>
                <textarea
                  placeholder="ព័ត៌មានលម្អិតអំពីសកម្មភាព..."
                  value={photoDesc}
                  onChange={(e) => setPhotoDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 resize-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">អ្នកបង្ហោះ</label>
                  <input
                    type="text"
                    value={uploadedBy}
                    onChange={(e) => setUploadedBy(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    រក្សាទុកសកម្មភាព
                  </button>
                </div>
              </div>
            </form>
          )}

          {isAddingDoc && (
            <form onSubmit={handleCreateDocument} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-2xl text-left animate-fadeIn">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <Plus className="h-4 w-4 text-emerald-600" />
                  បន្ថែមតំណភ្ជាប់ឯកសារថ្មី
                </h4>
                <button type="button" onClick={() => setIsAddingDoc(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">បិទ</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">ប្រភេទឯកសារ / Platform *</label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value as DocumentType)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-slate-800 font-semibold"
                  >
                    <option value="drive">Google Drive File</option>
                    <option value="doc">Google Doc</option>
                    <option value="classroom">Google Classroom Code/Link</option>
                    <option value="office">Microsoft Office Template</option>
                  </select>
                </div>

                {newDocType === 'office' && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-xs font-bold text-slate-600 block">ប្រភេទ MS Office *</label>
                    <select
                      value={newDocOfficeType}
                      onChange={(e) => setNewDocOfficeType(e.target.value as OfficeFileType)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-slate-800 font-semibold"
                    >
                      <option value="word">MS Word (.docx)</option>
                      <option value="excel">MS Excel (.xlsx)</option>
                      <option value="powerpoint">MS PowerPoint (.pptx)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">ចំណងជើងឯកសារ *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. កម្មវិធីសិក្សា Web Frontend Module 1"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-slate-800 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">តំណភ្ជាប់ URL (Google Drive / Classroom URL)</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/..."
                  value={newDocUrl}
                  onChange={(e) => setNewDocUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-slate-800 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">ព័ត៌មានបន្ថែម / ការណែនាំខ្លីៗ</label>
                <textarea
                  placeholder="ការណែនាំពីរបៀបប្រើប្រាស់ ឬគោលបំណងនៃឯកសារនេះ..."
                  value={newDocDesc}
                  onChange={(e) => setNewDocDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-slate-800 resize-none font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingDoc(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-5 rounded-xl text-xs transition"
                >
                  បង្កើតឯកសារ
                </button>
              </div>
            </form>
          )}

          {/* Google Drive Account Link Status Banner */}
          {activeTab === 'drive' && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs mb-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
                  <FolderOpen className="h-6 w-6" />
                </div>
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-900 text-sm">គណនី Google Drive ភ្ជាប់ជោគជ័យ</h4>
                    <span className="bg-amber-100 text-amber-800 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border border-amber-200">
                      Active Integration
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {currentUser ? (
                      <>គណនីភ្ជាប់បច្ចុប្បន្ន៖ <span className="font-mono font-bold text-slate-700">{currentUser.email}</span> (ឆ្លងកាត់ការផ្ទៀងផ្ទាត់សុវត្ថិភាព)</>
                    ) : (
                      <>គណនីភ្ជាប់បច្ចុប្បន្ន៖ <span className="font-mono font-bold text-slate-700">admin@workshop.kh</span> (របៀបសាកល្បង)</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  អនុញ្ញាតអានឯកសារ (Drive Readonly)
                </span>
              </div>
            </div>
          )}

          {/* Grid Display of Documents */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* If on photo tab, always show an "Add Photo" card at the beginning! */}
            {activeTab === 'photo' && !isUploading && (
              <div 
                onClick={() => setIsUploading(true)}
                className="bg-indigo-50/10 border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/20 rounded-2xl h-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 group"
              >
                <div className="h-14 w-14 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-xs">
                  <Plus className="h-6 w-6" />
                </div>
                <h5 className="font-bold text-indigo-900 text-sm">បង្ហោះរូបភាពសកម្មភាពថ្មី</h5>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">ជ្រើសរើសរូបថតសកម្មភាពសិក្ខាកាមពីកុំព្យូទ័រ ឬទូរស័ព្ទដៃរបស់អ្នកដើម្បីបង្ហោះចូលក្នុងប្រព័ន្ធ</p>
                <button 
                  type="button" 
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  ជ្រើសរើសរូបភាព
                </button>
              </div>
            )}

            {filteredDocs.length === 0 ? (
              activeTab === 'photo' ? null : (
                <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                  <FileText className="h-12 w-12 text-slate-300 mb-3 animate-pulse" />
                  <p className="text-slate-500 font-medium">រកមិនឃើញឯកសារដែលត្រូវនឹងការស្វែងរកឡើយ</p>
                </div>
              )
            ) : (
              filteredDocs.map((doc) => {
                const isPhoto = doc.type === 'photo';
                return (
                  <div 
                    key={doc.id} 
                    className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group h-full text-left"
                  >
                    {/* Visual Header (Photo or Colored Header Bar) */}
                    {isPhoto ? (
                      <div className="h-44 relative overflow-hidden bg-slate-100 shrink-0">
                        <img 
                          src={doc.url} 
                          alt={doc.title} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                          <Image className="h-3 w-3" />
                          រូបភាពសកម្មភាព
                        </div>
                      </div>
                    ) : (
                      <div className={`h-3 w-full shrink-0 ${
                        doc.type === 'drive' ? 'bg-amber-400' :
                        doc.type === 'doc' ? 'bg-blue-500' :
                        doc.type === 'classroom' ? 'bg-emerald-600' :
                        doc.officeType === 'word' ? 'bg-sky-600' :
                        doc.officeType === 'excel' ? 'bg-emerald-600' : 'bg-orange-500'
                      }`} />
                    )}

                    {/* Content Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Header line with badge and type */}
                        {!isPhoto && (
                          <div className="flex justify-between items-center mb-3">
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
                              doc.type === 'drive' ? 'border-amber-100 bg-amber-50 text-amber-800' :
                              doc.type === 'doc' ? 'border-blue-100 bg-blue-50 text-blue-800' :
                              doc.type === 'classroom' ? 'border-emerald-100 bg-emerald-50 text-emerald-800' :
                              getOfficeColorClass(doc.officeType)
                            }`}>
                              {getDocIcon(doc)}
                              {doc.category}
                            </span>
                            
                            {doc.fileSize && (
                              <span className="text-[10px] text-slate-400 font-mono font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                {doc.fileSize}
                              </span>
                            )}
                          </div>
                        )}

                        <h5 className="font-bold text-slate-800 text-xs leading-snug tracking-tight mb-2 group-hover:text-emerald-700 transition duration-150">
                          {doc.title}
                        </h5>

                        {doc.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-4 font-medium">
                            {doc.description}
                          </p>
                        )}
                      </div>

                      {/* Metadata and Footer Actions */}
                      <div className="border-t border-slate-50 pt-4 mt-auto">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 mb-4 font-semibold">
                          <span className="truncate max-w-[120px]">ដោយ: {doc.uploadedBy}</span>
                          <span>{doc.uploadedAt}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {doc.type === 'office' ? (
                            <button
                              onClick={() => handleDownloadFile(doc)}
                              className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-100 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                            >
                              <Download className="h-3.5 w-3.5" />
                              ទាញយកឯកសារ (.docx/.xlsx)
                            </button>
                          ) : (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-100 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              បើកមើលឯកសារ
                            </a>
                          )}

                          <button
                            onClick={() => onDeleteDocument(doc.id)}
                            className="p-2 border border-slate-100 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition duration-150"
                            title="លុបឯកសារ"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          MODAL 1: CREATE NEW WORKSHOP FOLDER
          ---------------------------------------------------- */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-[#0f172a]/70 backdrop-blur-xs flex items-center justify-center p-4 z-55">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden border border-slate-200 shadow-2xl animate-scaleUp text-left">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center border-b border-slate-800">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <Folder className="h-4.5 w-4.5 text-blue-500" />
                បង្កើតថតគ្រប់គ្រងឯកសារសិក្ខាសាលាថ្មី
              </h4>
              <button 
                onClick={() => setShowCreateFolderModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewFolder} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">ឈ្មោះសិក្ខាសាលាពេញ *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="ឧ. សិក្ខាសាលាស្តីពី៖ បច្ចេកវិទ្យាបង្កើតឡើងដើម្បីពង្រឹងសមត្ថភាពគ្រូជំនាន់ថ្មី"
                  value={newFolderTitle}
                  onChange={(e) => setNewFolderTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-semibold resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">ទីតាំង ខេត្ត/ក្រុង *</label>
                  <select
                    value={newFolderProvince}
                    onChange={(e) => setNewFolderProvince(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer"
                  >
                    {PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">កាលបរិច្ឆេទសិក្ខាសាលា *</label>
                  <input
                    type="date"
                    required
                    value={newFolderDate}
                    onChange={(e) => setNewFolderDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[10.5px] text-blue-800 leading-relaxed font-semibold">
                ✨ បន្ទាប់ពីបង្កើតរួច ប្រព័ន្ធនឹងរៀបចំបញ្ជីឯកសារទូទាត់បេសកកម្មចំនួន ៩ មុខដោយស្វ័យប្រវត្តិ ត្រៀមជាស្រេចសម្រាប់ការបំពេញ ឬភ្ជាប់ឯកសារ។
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setShowCreateFolderModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl text-xs shadow-md transition"
                >
                  បង្កើតថតថ្មី
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          MODAL 2: SIMULATED FILE UPLOADER FOR CHECKLIST
          ---------------------------------------------------- */}
      {uploadingDocId && (
        <div className="fixed inset-0 bg-[#0f172a]/70 backdrop-blur-xs flex items-center justify-center p-4 z-55 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden border border-slate-200 shadow-2xl text-left">
            <div className="bg-slate-950 text-white p-4 flex justify-between items-center">
              <h4 className="font-bold text-xs flex items-center gap-1.5">
                <Upload className="h-4 w-4 text-blue-400" />
                ភ្ជាប់ឯកសារភស្តុតាងបេសកកម្ម (Attach Document)
              </h4>
              <button 
                onClick={() => setUploadingDocId(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                ឯកសារ៖ {activeFolder.documents.find(d => d.id === uploadingDocId)?.title}
              </p>

              {/* Hidden file input for manual select via click */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              />

              {/* Drag and Drop Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  simulatedDragActive ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setSimulatedDragActive(true); }}
                onDragLeave={() => setSimulatedDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSimulatedDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0];
                    setSimulatedFileName(file.name);
                    setSimulatedFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
                  }
                }}
              >
                <Upload className="h-8 w-8 text-slate-400 mb-2 animate-bounce" />
                <p className="text-xs font-bold text-slate-700">អូសទម្លាក់ឯកសារនៅទីនេះ ឬ ចុចដើម្បីជ្រើសរើស</p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">គាំទ្រទម្រង់ PDF, Word, Excel (ទំហំអតិបរមា 10MB)</p>
                {simulatedFileName && (
                  <div className="mt-3 px-3 py-1 bg-blue-50 text-blue-700 text-[10.5px] font-bold rounded-full flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-blue-500 shrink-0" />
                    បានជ្រើសរើស៖ {simulatedFileName} {simulatedFileSize && `(${simulatedFileSize})`}
                  </div>
                )}
              </div>

              {/* Manual Input File Name Mock */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block">ឬ វាយបញ្ចូលឈ្មោះឯកសារជាអក្សរ</label>
                <input
                  type="text"
                  placeholder="ឧ. mission_order_certified_signed.pdf"
                  value={simulatedFileName}
                  onChange={(e) => setSimulatedFileName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Progress Bar simulation */}
              {isUploadingProgress && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-blue-600">កំពុងបង្ហោះចូលប្រព័ន្ធ...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-150" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setUploadingDocId(null)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50"
                  disabled={isUploadingProgress}
                >
                  បោះបង់
                </button>
                <button
                  onClick={handleSimulateAttachFile}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg flex items-center gap-1 shadow"
                  disabled={isUploadingProgress}
                >
                  {isUploadingProgress ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកឯកសារ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
