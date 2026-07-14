import { useState, FormEvent, ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import { Trainee, ShiftType } from '../types';
import { UserPlus, Search, SlidersHorizontal, Trash2, Edit2, Check, User, Mail, Phone, Calendar, Clock, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface TraineeManagerProps {
  trainees: Trainee[];
  onAddTrainee: (trainee: Trainee) => void;
  onDeleteTrainee: (id: string) => void;
}

export default function TraineeManager({ trainees, onAddTrainee, onDeleteTrainee }: TraineeManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState<'all' | ShiftType>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'ប្រុស' | 'ស្រី'>('all');
  
  // Add Trainee form state
  const [isAdding, setIsAdding] = useState(false);
  const [activeAddMethod, setActiveAddMethod] = useState<'manual' | 'excel'>('manual');
  
  // Manual registration states
  const [nameKh, setNameKh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'ប្រុស' | 'ស្រី'>('ប្រុស');
  const [shift, setShift] = useState<ShiftType>('morning');

  // Excel registration states
  const [parsedTrainees, setParsedTrainees] = useState<Trainee[]>([]);
  const [importError, setImportError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nameKh || !nameEn || !studentId) return;

    const newTrainee: Trainee = {
      id: `T-${Date.now()}`,
      nameKh,
      nameEn,
      studentId,
      email: email || 'N/A',
      phone: phone || 'N/A',
      gender,
      shift,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    onAddTrainee(newTrainee);
    
    // Clear form
    setNameKh('');
    setNameEn('');
    setStudentId('');
    setEmail('');
    setPhone('');
    setIsAdding(false);
  };

  const handleFileImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    setParsedTrainees([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<any>(worksheet);

        if (json.length === 0) {
          setImportError('ឯកសារគ្មានទិន្នន័យ ឬខុសទម្រង់ឡើយ។');
          return;
        }

        const tempTrainees: Trainee[] = [];
        
        json.forEach((row: any, idx: number) => {
          const keys = Object.keys(row);
          
          const findVal = (possibleHeaders: string[]): string => {
            const match = keys.find(k => 
              possibleHeaders.some(ph => k.toLowerCase().trim() === ph.toLowerCase() || k.trim() === ph)
            );
            return match ? String(row[match]).trim() : '';
          };

          const khName = findVal(['ឈ្មោះខ្មែរ', 'ឈ្មោះ', 'ឈ្មោះពេញ', 'name khmer', 'name kh', 'name', 'full name', 'fullname']);
          const enName = findVal(['ឈ្មោះឡាតាំង', 'ឈ្មោះអង់គ្លេស', 'name english', 'name en', 'latin name', 'english name']);
          const sId = findVal(['អត្តលេខ', 'student id', 'id', 'student_id', 'code', 'លេខសម្គាល់']);
          const rawGender = findVal(['ភេទ', 'gender', 'sex']);
          const rawShift = findVal(['វេន', 'shift', 'time']);
          const phoneVal = findVal(['ទូរស័ព្ទ', 'លេខទូរស័ព្ទ', 'phone', 'telephone', 'phone number', 'tel']);
          const emailVal = findVal(['អ៊ីមែល', 'អ៊ីម៉ែល', 'email', 'e-mail', 'mail']);

          let finalKhName = khName;
          let finalEnName = enName;
          let finalStudentId = sId;

          // Intelligently fallback if header names are slightly off
          if (!finalKhName && keys[0]) finalKhName = String(row[keys[0]]).trim();
          if (!finalEnName && keys[1]) finalEnName = String(row[keys[1]]).trim();
          if (!finalStudentId) {
            if (keys[2]) {
              finalStudentId = String(row[keys[2]]).trim();
            } else {
              finalStudentId = `ID-${Date.now()}-${idx}`;
            }
          }

          // Normalize gender values
          let finalGender: 'ប្រុស' | 'ស្រី' = 'ប្រុស';
          if (rawGender) {
            const g = rawGender.toLowerCase();
            if (g.includes('ស្រី') || g === 'female' || g === 'f' || g === 'woman' || g === 'girl') {
              finalGender = 'ស្រី';
            }
          }

          // Normalize shift values
          let finalShift: ShiftType = 'morning';
          if (rawShift) {
            const s = rawShift.toLowerCase();
            if (s.includes('រសៀល') || s.includes('afternoon') || s.includes('pm') || s === 'afternoon' || s === 'a') {
              finalShift = 'afternoon';
            }
          }

          if (finalKhName) {
            tempTrainees.push({
              id: `T-EXCEL-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
              nameKh: finalKhName,
              nameEn: finalEnName || finalKhName,
              studentId: finalStudentId,
              gender: finalGender,
              shift: finalShift,
              email: emailVal || 'N/A',
              phone: phoneVal || 'N/A',
              joinedDate: new Date().toISOString().split('T')[0],
            });
          }
        });

        if (tempTrainees.length === 0) {
          setImportError('មិនអាចស្វែងរកទិន្នន័យសិក្ខាកាមដែលមានតម្លៃត្រឹមត្រូវនៅក្នុង Microsoft File នេះឡើយ។');
        } else {
          setParsedTrainees(tempTrainees);
        }
      } catch (err) {
        console.error(err);
        setImportError('ការអានឯកសារ Microsoft បានបរាជ័យ។ សូមប្រាកដថាជាឯកសារ Excel ឬ CSV ត្រឹមត្រូវ។');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmImport = () => {
    parsedTrainees.forEach(t => onAddTrainee(t));
    const count = parsedTrainees.length;
    setParsedTrainees([]);
    setIsAdding(false);
    alert(`បានបញ្ចូលសិក្ខាកាមថ្មីចំនួន ${count} នាក់ ទៅក្នុងប្រព័ន្ធដោយជោគជ័យ!`);
  };

  const filteredTrainees = trainees.filter((t) => {
    const matchesSearch = t.nameKh.includes(searchQuery) || 
                          t.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesShift = shiftFilter === 'all' || t.shift === shiftFilter;
    const matchesGender = genderFilter === 'all' || t.gender === genderFilter;

    return matchesSearch && matchesShift && matchesGender;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Controls: Search, Filters & Add Button */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full xl:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="ស្វែងរក ឈ្មោះ ឬអត្តលេខ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-slate-800 transition text-slate-800"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">តម្រង:</span>
          </div>

          {/* Shift Filter */}
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 border-0 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-slate-800"
          >
            <option value="all">វេនសិក្សាទាំងអស់</option>
            <option value="morning">វេនព្រឹក (08:00am - 11:00am)</option>
            <option value="afternoon">វេនរសៀល (02:00pm - 05:00pm)</option>
          </select>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 border-0 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-slate-800"
          >
            <option value="all">ភេទទាំងអស់</option>
            <option value="ប្រុស">ប្រុស</option>
            <option value="ស្រី">ស្រី</option>
          </select>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="ml-auto xl:ml-0 flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2 px-4 rounded-xl transition"
          >
            <UserPlus className="h-4 w-4" />
            ចុះឈ្មោះសិក្ខាកាមថ្មី
          </button>
        </div>
      </div>

      {/* Add Trainee Form Panel */}
      {isAdding && (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 max-w-4xl animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-50 pb-3">
            <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-600" />
              ចុះឈ្មោះព័ត៌មានសិក្ខាកាមថ្មី
            </h4>
            
            {/* Tab Selectors */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveAddMethod('manual');
                  setParsedTrainees([]);
                  setImportError('');
                }}
                className={`flex-1 md:flex-initial py-1.5 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeAddMethod === 'manual' 
                    ? 'bg-white text-slate-800 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                បំពេញដោយដៃ
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveAddMethod('excel');
                }}
                className={`flex-1 md:flex-initial py-1.5 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeAddMethod === 'excel' 
                    ? 'bg-white text-slate-800 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                បញ្ចូលពី Microsoft File (Excel)
              </button>
            </div>
          </div>

          {activeAddMethod === 'manual' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">ឈ្មោះជាភាសាខ្មែរ *</label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. សុខ ដារ៉ា"
                    value={nameKh}
                    onChange={(e) => setNameKh(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">ឈ្មោះជាភាសាអង់គ្លេស *</label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. Sok Dara"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">អត្តលេខសម្គាល់សិក្ខាកាម (Student ID) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. ST-2026-099"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-slate-800 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">លេខទូរស័ព្ទ</label>
                  <input
                    type="text"
                    placeholder="ឧ. 012 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">សារអេឡិចត្រូនិច (Email)</label>
                  <input
                    type="email"
                    placeholder="ឧ. dara.sok@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">ភេទ *</label>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === 'ប្រុស'}
                        onChange={() => setGender('ប្រុស')}
                        className="accent-slate-800"
                      />
                      ប្រុស
                    </label>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === 'ស្រី'}
                        onChange={() => setGender('ស្រី')}
                        className="accent-slate-800"
                      />
                      ស្រី
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">វេនសិក្សា *</label>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="shift"
                        checked={shift === 'morning'}
                        onChange={() => setShift('morning')}
                        className="accent-slate-800"
                      />
                      វេនព្រឹក (08:00 - 11:00 AM)
                    </label>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="shift"
                        checked={shift === 'afternoon'}
                        onChange={() => setShift('afternoon')}
                        className="accent-slate-800"
                      />
                      វេនរសៀល (02:00 - 05:00 PM)
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 border border-slate-100 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 px-5 rounded-xl text-sm transition"
                >
                  ចុះឈ្មោះ
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              {parsedTrainees.length === 0 ? (
                <div className="space-y-4">
                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-2xl p-8 text-center transition bg-slate-50/50 relative flex flex-col items-center justify-center min-h-[180px]">
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileImport}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <FileSpreadsheet className="h-10 w-10 text-emerald-600 mb-3 animate-pulse" />
                    <p className="text-sm font-bold text-slate-700">សូមអូសទាញ ឬចុចជ្រើសរើសឯកសារ Microsoft File</p>
                    <p className="text-xs text-slate-400 mt-1">គាំទ្រទម្រង់ឯកសារ Excel (.xlsx, .xls) ឬ CSV (.csv)</p>
                  </div>

                  {/* Format Guidelines Card */}
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2 text-xs text-slate-600">
                    <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-slate-500" />
                      💡 របៀបរៀបចំចំណងជើងជួរឈរក្នុង Excel (Suggested Header Formats):
                    </h5>
                    <p className="text-[11px] leading-relaxed text-slate-500 pl-5">
                      ដើម្បីឱ្យប្រព័ន្ធស្វែងរក និងផ្គូផ្គងជួរឈរដោយស្វ័យប្រវត្តិ សូមប្រើប្រាស់ឈ្មោះចំណងជើងខាងក្រោម៖
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pl-5 pt-1 text-[11px]">
                      <div>• <b>ឈ្មោះខ្មែរ:</b> <span className="font-mono text-slate-500">ឈ្មោះខ្មែរ, ឈ្មោះ, Name Khmer, Name KH, Name</span></div>
                      <div>• <b>ឈ្មោះអង់គ្លេស:</b> <span className="font-mono text-slate-500">ឈ្មោះឡាតាំង, ឈ្មោះអង់គ្លេស, Name English, Name EN</span></div>
                      <div>• <b>អត្តលេខសម្គាល់:</b> <span className="font-mono text-slate-500">អត្តលេខ, Student ID, ID, លេខសម្គាល់</span></div>
                      <div>• <b>ភេទ:</b> <span className="font-mono text-slate-500">ភេទ, Gender (ប្រុស/ស្រី ឬ Male/Female)</span></div>
                      <div>• <b>វេនសិក្សា:</b> <span className="font-mono text-slate-500">វេន, Shift (ព្រឹក/រសៀល ឬ Morning/Afternoon)</span></div>
                      <div>• <b>លេខទូរស័ព្ទ & អ៊ីមែល:</b> <span className="font-mono text-slate-500">Phone, Tel, Email, អ៊ីមែល</span></div>
                    </div>
                  </div>

                  {importError && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {importError}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-4 py-2 border border-slate-100 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                      បោះបង់
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* parsed preview table */}
                  <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                    <div className="text-xs text-emerald-800 font-bold flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      បានរកឃើញទិន្នន័យសិក្ខាកាមចំនួន {parsedTrainees.length} នាក់ ត្រឹមត្រូវពីឯកសារ Excel!
                    </div>
                    <button
                      onClick={() => setParsedTrainees([])}
                      className="text-xs text-slate-500 hover:text-red-600 font-semibold"
                    >
                      ជ្រើសរើសឯកសារផ្សេងទៀត
                    </button>
                  </div>

                  <div className="border border-slate-150 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                    <table className="w-full text-left text-xs text-slate-600 border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150 font-bold text-slate-700">
                          <th className="p-2.5 pl-4">ឈ្មោះខ្មែរ</th>
                          <th className="p-2.5">Name Latin</th>
                          <th className="p-2.5">អត្តលេខ</th>
                          <th className="p-2.5">ភេទ</th>
                          <th className="p-2.5">វេនសិក្សា</th>
                          <th className="p-2.5">លេខទូរស័ព្ទ</th>
                          <th className="p-2.5 pr-4">អ៊ីមែល</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedTrainees.map((t, index) => (
                          <tr key={index} className="hover:bg-slate-50/50">
                            <td className="p-2.5 pl-4 font-semibold text-slate-800">{t.nameKh}</td>
                            <td className="p-2.5 font-mono text-slate-500">{t.nameEn}</td>
                            <td className="p-2.5 font-mono font-bold text-slate-700">{t.studentId}</td>
                            <td className="p-2.5">{t.gender}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                t.shift === 'morning' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {t.shift === 'morning' ? 'វេនព្រឹក' : 'វេនរសៀល'}
                              </span>
                            </td>
                            <td className="p-2.5">{t.phone}</td>
                            <td className="p-2.5 pr-4 truncate max-w-[120px]">{t.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setParsedTrainees([]);
                        setIsAdding(false);
                      }}
                      className="px-4 py-2 border border-slate-100 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                      បោះបង់
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmImport}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-5 rounded-xl text-sm transition shadow-xs"
                    >
                      យល់ព្រមបញ្ចូលទាំង {parsedTrainees.length} នាក់ក្នុងប្រព័ន្ធ
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Trainee Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTrainees.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center">
            <User className="h-12 w-12 text-slate-300 mb-3 animate-pulse" />
            <p className="text-slate-500 font-medium">រកមិនឃើញគណនីសិក្ខាកាមឡើយ</p>
          </div>
        ) : (
          filteredTrainees.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 p-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Profile Info */}
                <div className="flex items-center gap-3.5">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-base font-bold shrink-0 ${
                    t.gender === 'ប្រុស'
                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                      : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}>
                    {t.nameKh.substring(0, 2)}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-base leading-tight">
                      {t.nameKh}
                    </h5>
                    <p className="text-xs font-mono text-slate-400 font-medium tracking-wide mt-0.5 uppercase">
                      {t.nameEn}
                    </p>
                  </div>
                </div>

                {/* Info Fields Grid */}
                <div className="grid grid-cols-1 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">អត្តលេខសិក្ខាកាម:</span>
                    <span className="font-mono font-bold text-slate-800">{t.studentId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">ភេទ:</span>
                    <span className="font-semibold text-slate-700">{t.gender}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">វេនសិក្សា:</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1 ${
                      t.shift === 'morning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      <Clock className="h-3 w-3" />
                      {t.shift === 'morning' ? 'វេនព្រឹក' : 'វេនរសៀល'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-dashed border-slate-200 pt-2 mt-1">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      ទូរស័ព្ទ:
                    </span>
                    <span className="font-semibold text-slate-700">{t.phone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      សារអេឡិចត្រូនិច:
                    </span>
                    <span className="font-semibold text-slate-700 truncate max-w-[150px]">{t.email}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between border-t border-slate-50 pt-3.5 mt-4">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  ចុះឈ្មោះ: {t.joinedDate}
                </span>
                
                <button
                  onClick={() => onDeleteTrainee(t.id)}
                  className="p-1.5 border border-slate-100 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition duration-150"
                  title="លុបព័ត៌មានសិក្ខាកាម"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
