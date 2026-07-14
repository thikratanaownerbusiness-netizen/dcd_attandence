import React, { useEffect, useRef, useState } from 'react';
import { AttendanceLog } from '../types';
import { MapPin, RefreshCw, Layers, Compass, Smartphone, Edit2, Check, Navigation, AlertCircle, Search } from 'lucide-react';

interface MapTrackerProps {
  logs: AttendanceLog[];
  selectedLog: AttendanceLog | null;
  onSelectLog: (log: AttendanceLog | null) => void;
  workshopName: string;
  workshopLat: number;
  workshopLng: number;
  onUpdateWorkshop: (name: string, lat: number, lng: number) => void;
}

export default function MapTracker({ 
  logs, 
  selectedLog, 
  onSelectLog,
  workshopName,
  workshopLat,
  workshopLng,
  onUpdateWorkshop
}: MapTrackerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(false);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(workshopName);
  const [editLat, setEditLat] = useState(workshopLat.toString());
  const [editLng, setEditLng] = useState(workshopLng.toString());

  // Geocoding States
  const [isSearchingGps, setIsSearchingGps] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleGeocodeSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsSearchingGps(true);
    setSearchError(null);
    setSearchResults([]);
    try {
      // Append Cambodia/Phnom Penh to focus search if not present
      const hasCambodia = queryText.toLowerCase().includes('cambodia') || queryText.toLowerCase().includes('កម្ពុជា');
      const searchQuery = hasCambodia ? queryText : `${queryText}, Cambodia`;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`
      );
      if (!response.ok) {
        throw new Error();
      }
      const data = await response.json();
      if (data && data.length > 0) {
        setSearchResults(data);
        // Auto populate top result immediately
        const topResult = data[0];
        setEditLat(parseFloat(topResult.lat).toFixed(6));
        setEditLng(parseFloat(topResult.lon).toFixed(6));
      } else {
        setSearchError('រកមិនឃើញទីតាំងនេះទេ! សូមព្យាយាមសរសេរឱ្យចំឈ្មោះច្បាស់លាស់ជាងនេះ។');
      }
    } catch (err) {
      console.error(err);
      setSearchError('មិនអាចស្វែងរកទីតាំងបានទេ។ សូមពិនិត្យការភ្ជាប់អ៊ីនធឺណិតរបស់អ្នក!');
    } finally {
      setIsSearchingGps(false);
    }
  };

  // Filter logs that have GPS coordinates
  const logsWithGps = logs.filter(log => log.latitude !== null && log.longitude !== null);

  useEffect(() => {
    // 1. Append Leaflet CSS if not already there
    const CSS_ID = 'leaflet-css';
    if (!document.getElementById(CSS_ID)) {
      const link = document.createElement('link');
      link.id = CSS_ID;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // 2. Append Leaflet JS script
    const SCRIPT_ID = 'leaflet-js';
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement;

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      try {
        // Destroy existing map if it exists
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Default location (Phnom Penh or configured workshop)
        const defaultCenter: [number, number] = [workshopLat, workshopLng];
        const initialCenter: [number, number] = selectedLog?.latitude && selectedLog?.longitude
          ? [selectedLog.latitude, selectedLog.longitude]
          : defaultCenter;

        // Create map
        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
        }).setView(initialCenter, 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        mapInstanceRef.current = map;
        setMapLoaded(true);
        setLoadingError(false);
      } catch (err) {
        console.error('Failed to initialize Leaflet Map:', err);
        setLoadingError(true);
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      script.onerror = () => setLoadingError(true);
      document.body.appendChild(script);
    } else {
      // Script already exists, wait and init
      const checkInterval = setInterval(() => {
        if ((window as any).L) {
          clearInterval(checkInterval);
          initMap();
        }
      }, 100);
      setTimeout(() => clearInterval(checkInterval), 3000);
    }

    return () => {
      // We don't remove scripts to avoid reloading multiple times, but we clear markers and instances
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when logs, mapLoaded, or workshop state changes
  useEffect(() => {
    const L = (window as any).L;
    const map = mapInstanceRef.current;
    if (!L || !map || !mapLoaded) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // 1. Add Workshop Center Marker and Geofence 10m Circle
    try {
      const currentLat = isEditing ? (parseFloat(editLat) || workshopLat) : workshopLat;
      const currentLng = isEditing ? (parseFloat(editLng) || workshopLng) : workshopLng;

      const workshopColor = isEditing ? '#EA580C' : '#2563EB'; // Orange/amber pin when drafting, Blue when saved
      const workshopEmoji = isEditing ? '📍' : '🏢';

      const workshopIcon = L.divIcon({
        className: 'custom-workshop-marker',
        html: `
          <div style="
            position: relative;
            width: 36px;
            height: 36px;
            background-color: ${workshopColor};
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            color: #ffffff;
            z-index: 9999;
          ">
            ${workshopEmoji}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const popupContent = isEditing
        ? `
          <div style="font-family: 'Kantumruy Pro', sans-serif; font-size: 13px; line-height: 1.4; max-width: 200px;">
            <strong style="color: #EA580C; font-size: 14px;">📍 កំពុងជ្រើសរើសទីតាំងថ្មី...</strong><br/>
            <span style="color: #4B5563; font-weight: 500;">អ្នកអាចចុចលើផែនទីដើម្បីប្ដូរទីតាំង</span><br/>
            <span style="font-size: 11px; color: #EA580C; font-weight: 600;">រង្វង់ស្កេនថ្មី៖ ១០ម៉ែត្រ</span><br/>
            <span style="font-size: 10px; color: #9CA3AF; font-family: monospace;">(${currentLat.toFixed(6)}, ${currentLng.toFixed(6)})</span>
          </div>
        `
        : `
          <div style="font-family: 'Kantumruy Pro', sans-serif; font-size: 13px; line-height: 1.4; max-width: 200px;">
            <strong style="color: #1E40AF; font-size: 14px;">ទីតាំងសិក្ខាសាលាកំណត់</strong><br/>
            <span style="color: #4B5563; font-weight: 500;">${workshopName}</span><br/>
            <span style="font-size: 11px; color: #2563EB; font-weight: 600;">រង្វង់ស្កេន៖ ១០ម៉ែត្រ (Geofence)</span><br/>
            <span style="font-size: 10px; color: #9CA3AF; font-family: monospace;">(${currentLat.toFixed(6)}, ${currentLng.toFixed(6)})</span>
          </div>
        `;

      const wsMarker = L.marker([currentLat, currentLng], { icon: workshopIcon })
        .addTo(map)
        .bindPopup(popupContent);
      markersRef.current.push(wsMarker);

      if (isEditing) {
        wsMarker.openPopup();
      }

      const wsGeofence = L.circle([currentLat, currentLng], {
        radius: 10, // 10 meters geofence!
        color: workshopColor,
        fillColor: isEditing ? '#FDBA74' : '#60A5FA',
        fillOpacity: 0.35,
        weight: 2.5,
        dashArray: '5, 5'
      }).addTo(map);
      markersRef.current.push(wsGeofence);
    } catch (err) {
      console.error('Error drawing workshop markers:', err);
    }

    // 2. Add markers for each log with GPS
    logsWithGps.forEach(log => {
      if (log.latitude === null || log.longitude === null) return;

      const isSelected = selectedLog?.id === log.id;
      
      // Determine marker color based on status
      let markerColor = '#10B981'; // green for present
      if (log.status === 'late') markerColor = '#F59E0B'; // amber
      if (log.status === 'absent') markerColor = '#EF4444'; // red
      if (log.status === 'excused') markerColor = '#3B82F6'; // blue

      // Custom HTML Marker icon
      const customIcon = L.divIcon({
        className: 'custom-gps-marker',
        html: `
          <div style="
            position: relative;
            width: ${isSelected ? '36px' : '28px'};
            height: ${isSelected ? '36px' : '28px'};
            background-color: ${markerColor};
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: bold;
            font-size: ${isSelected ? '12px' : '10px'};
            transition: all 0.2s ease-in-out;
          ">
            ${log.traineeName.substring(0, 2)}
            <div style="
              position: absolute;
              bottom: -6px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 6px solid ${markerColor};
            "></div>
          </div>
        `,
        iconSize: isSelected ? [36, 36] : [28, 28],
        iconAnchor: isSelected ? [18, 36] : [14, 28],
      });

      const marker = L.marker([log.latitude, log.longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: 'Kantumruy Pro', sans-serif; font-size: 13px; line-height: 1.4;">
            <strong style="color: #1F2937; font-size: 14px;">${log.traineeName} (${log.studentId})</strong><br/>
            <span style="color: #6B7280;">វេន: ${log.shift === 'morning' ? 'ព្រឹក' : 'រសៀល'}</span><br/>
            <span style="color: #6B7280;">ម៉ោងស្កេន: ${log.checkInTime}</span><br/>
            <span style="color: #10B981; font-weight: 500;">ឧបករណ៍: ${log.deviceName}</span><br/>
            <span style="font-size: 11px; color: #9CA3AF;">កូអរដោនេ: ${log.latitude.toFixed(6)}, ${log.longitude.toFixed(6)}</span>
          </div>
        `);

      marker.on('click', () => {
        onSelectLog(log);
      });

      markersRef.current.push(marker);

      if (isSelected) {
        map.setView([log.latitude, log.longitude], 17);
        marker.openPopup();
      }
    });
  }, [logs, mapLoaded, selectedLog, workshopLat, workshopLng, workshopName, isEditing, editLat, editLng]);

  // Handle click on map to Pin/Select workshop location when isEditing is true
  useEffect(() => {
    const L = (window as any).L;
    const map = mapInstanceRef.current;
    if (!L || !map || !mapLoaded) return;

    if (!isEditing) return;

    const onMapClick = (e: any) => {
      const { lat, lng } = e.latlng;
      setEditLat(lat.toFixed(6));
      setEditLng(lng.toFixed(6));
    };

    map.on('click', onMapClick);
    
    // Change cursor on map to crosshair to signal you can click to Pin!
    const container = map.getContainer();
    if (container) {
      container.style.cursor = 'crosshair';
    }

    return () => {
      map.off('click', onMapClick);
      if (container) {
        container.style.cursor = '';
      }
    };
  }, [isEditing, mapLoaded]);

  // Center selected log on click
  const handleFocusLog = (log: AttendanceLog) => {
    onSelectLog(log);
    const map = mapInstanceRef.current;
    if (map && log.latitude !== null && log.longitude !== null) {
      map.setView([log.latitude, log.longitude], 17);
    }
  };

  const handleSaveWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(editLat);
    const lng = parseFloat(editLng);
    if (isNaN(lat) || isNaN(lng)) {
      alert('សូមបញ្ចូលកូអរដោនេឡាទីទុយ និងឡុងហ្ស៊ីទីទុយឲ្យបានត្រឹមត្រូវ!');
      return;
    }
    onUpdateWorkshop(editName, lat, lng);
    setIsEditing(false);
  };

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

  const selectedDistance = selectedLog?.latitude && selectedLog?.longitude
    ? getDistanceInMeters(selectedLog.latitude, selectedLog.longitude, workshopLat, workshopLng)
    : null;

  return (
    <div className="space-y-6">
      {/* Workshop Location Config Panel */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-slate-50">
          <div>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              កម្រងកំណត់ទីតាំងសិក្ខាសាលា
            </span>
            <h2 className="font-semibold text-slate-800 text-lg mt-1 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              ផ្ទៀងផ្ទាត់ និងកំណត់ទីតាំងសិក្ខាសាលា (Geofence Limit: 10m)
            </h2>
          </div>

          {!isEditing ? (
            <button
              onClick={() => {
                setEditName(workshopName);
                setEditLat(workshopLat.toString());
                setEditLng(workshopLng.toString());
                setIsEditing(true);
              }}
              className="flex items-center gap-1.5 text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-semibold py-2 px-4 rounded-xl border border-slate-200/60 transition"
            >
              <Edit2 className="h-3.5 w-3.5" />
              កែសម្រួលទីតាំងសិក្ខាសាលា
            </button>
          ) : null}
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveWorkshop} className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            {/* Visual Instructions Alert */}
            <div className="bg-amber-50 border border-amber-200/70 text-amber-900 px-4 py-3 rounded-xl text-xs font-semibold flex items-start gap-2.5 shadow-xs">
              <span className="text-base leading-none mt-0.5 animate-bounce">👉</span>
              <div className="space-y-1">
                <p className="font-bold text-amber-950 text-xs">របៀបដៅផែនទីរហ័ស (Quick Map Pinning)៖</p>
                <p className="text-amber-800 text-[11px] font-medium leading-relaxed">លោកអ្នកអាចសរសេរស្វែងរក ឬ<strong className="text-orange-950 font-bold">ចុចផ្ទាល់លើទីតាំងណាមួយនៅលើផែនទីខាងក្រោម (Click on Map)</strong> ដើម្បីទាញយកកូអរដោនេឡាទីទុយ និងឡុងហ្ស៊ីទីទុយដោយស្វ័យប្រវត្តិ និងច្បាស់លាស់បំផុត!</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 relative">
                <label className="text-xs font-semibold text-slate-600 flex justify-between items-center">
                  <span>ឈ្មោះទីតាំងរៀបចំសិក្ខាសាលា (Workshop Location)</span>
                  {isSearchingGps && (
                    <span className="text-[10px] text-blue-600 font-semibold animate-pulse flex items-center gap-1">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      កំពុងស្វែងរក...
                    </span>
                  )}
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleGeocodeSearch(editName);
                      }
                    }}
                    className="flex-1 text-xs font-medium border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ឧ. ITC វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleGeocodeSearch(editName)}
                    disabled={isSearchingGps}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-[11px] font-bold px-3 py-2 rounded-xl transition duration-150 flex items-center gap-1 shrink-0 shadow-sm"
                    title="ស្វែងរកកូអរដោនេ GPS ស្វ័យប្រវត្តិតាមឈ្មោះ"
                  >
                    <Search className="h-3.5 w-3.5" />
                    ស្វែងរក
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 z-50 bg-white border border-slate-200 rounded-xl shadow-lg mt-1 p-1 max-h-48 overflow-y-auto text-xs">
                    <div className="text-[10px] text-slate-400 font-bold px-2 py-1 uppercase border-b border-slate-100 flex justify-between items-center">
                      <span>លទ្ធផលរកឃើញ ({searchResults.length})៖</span>
                      <button
                        type="button"
                        onClick={() => setSearchResults([])}
                        className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                      >
                        បិទ
                      </button>
                    </div>
                    {searchResults.map((result, idx) => {
                      const shortName = result.display_name.split(',')[0] || result.display_name;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setEditName(shortName);
                            setEditLat(parseFloat(result.lat).toFixed(6));
                            setEditLng(parseFloat(result.lon).toFixed(6));
                            setSearchResults([]);
                          }}
                          className="w-full text-left px-2 py-2 hover:bg-blue-50/50 rounded-lg transition text-slate-700 truncate block border-b border-slate-50 last:border-b-0"
                          title={result.display_name}
                        >
                          <span className="font-semibold text-slate-800 block">📍 {shortName}</span>
                          <span className="text-[10px] text-slate-400 block truncate font-mono mt-0.5">
                            ({parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}) - {result.display_name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {searchError && (
                  <p className="text-[10px] text-rose-500 font-medium mt-1">
                    ⚠️ {searchError}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">ឡាទីទុយ (Latitude Coordinates)</label>
                <input
                  type="text"
                  value={editLat}
                  onChange={(e) => setEditLat(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ឧ. 11.5564"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">ឡុងហ្ស៊ីទីទុយ (Longitude Coordinates)</label>
                <input
                  type="text"
                  value={editLng}
                  onChange={(e) => setEditLng(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ឧ. 104.9282"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold py-2 px-4 transition"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl transition shadow-sm shadow-blue-200"
              >
                <Check className="h-3.5 w-3.5" />
                រក្សាទុកការផ្លាស់ប្តូរ
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs font-medium text-slate-700">
            <div className="md:col-span-5 bg-slate-50 p-3 rounded-xl border border-slate-100/80">
              <span className="block text-[10px] text-slate-400 font-bold mb-0.5">ឈ្មោះទីតាំងបច្ចុប្បន្ន</span>
              <span className="text-slate-800 font-semibold">{workshopName}</span>
            </div>
            <div className="md:col-span-3 bg-slate-50 p-3 rounded-xl border border-slate-100/80">
              <span className="block text-[10px] text-slate-400 font-bold mb-0.5">កូអរដោនេឡាទីទុយ (Latitude)</span>
              <span className="font-mono text-blue-700">{workshopLat}</span>
            </div>
            <div className="md:col-span-3 bg-slate-50 p-3 rounded-xl border border-slate-100/80">
              <span className="block text-[10px] text-slate-400 font-bold mb-0.5">កូអរដោនេឡុងហ្ស៊ីទីទុយ (Longitude)</span>
              <span className="font-mono text-blue-700">{workshopLng}</span>
            </div>
            <div className="md:col-span-1 bg-blue-50 p-3 rounded-xl border border-blue-100/60 flex flex-col items-center justify-center text-center">
              <span className="block text-[9px] text-blue-500 font-bold">ដែនកំណត់</span>
              <span className="text-blue-800 font-bold text-sm">១០ ម.</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Map Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        
        {/* Sidebar List of GPS Scans */}
        <div className="lg:col-span-1 flex flex-col h-[480px]">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-lg">
              <Compass className="h-5 w-5 text-emerald-600" />
              ទីតាំងស្កេនវត្តមាន (GPS)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              បញ្ជីសិក្ខាកាមដែលបានស្កេនវត្តមានជាមួយកូអរដោនេពិតប្រាកដ
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {logsWithGps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <MapPin className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm text-slate-400 font-medium">មិនទាន់មានទិន្នន័យ GPS ស្កេនឡើយ</p>
              </div>
            ) : (
              logsWithGps.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                return (
                  <button
                    key={log.id}
                    onClick={() => handleFocusLog(log)}
                    className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all duration-200 flex flex-col gap-1.5 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-sm'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="font-semibold text-slate-800">{log.traineeName}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        log.status === 'present' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {log.status === 'present' ? 'ទាន់ពេល' : 'យឺត'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500 font-mono">
                      <div className="flex items-center gap-1">
                        <Compass className="h-3 w-3 text-slate-400" />
                        <span>{log.latitude?.toFixed(4)}, {log.longitude?.toFixed(4)}</span>
                      </div>
                      <div className="text-right text-slate-600 font-medium">
                        {log.checkInTime}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 border-t border-dashed border-slate-200 pt-1.5 mt-0.5">
                      <Smartphone className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate">{log.deviceName}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Interactive Map Area */}
        <div className="lg:col-span-2 relative h-[480px] rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shadow-inner flex flex-col">
          {/* Top Floating Control */}
          <div className="absolute top-3 left-12 z-[1000] bg-white/95 backdrop-blur shadow-md px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Layers className="h-3.5 w-3.5 text-blue-600" />
            <span>ទម្រង់ផែនទី: Leaflet OpenStreetMap + geofence ១០ម៉ែត្រ</span>
          </div>

          {loadingError ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50">
              <div className="p-3 bg-red-50 rounded-full text-red-500 mb-3">
                <MapPin className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">មានបញ្ហាក្នុងការទាញយកផែនទី</h4>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                មិនអាចដំណើរការសេវាកម្មផែនទីពីប្រភពក្រៅបានទេ។ សូមប្រាកដថាអ្នកមានការតភ្ជាប់អ៊ីនធឺណិត។
              </p>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-1.5 text-xs bg-slate-800 text-white font-medium py-1.5 px-3 rounded-lg hover:bg-slate-700 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                ព្យាយាមឡើងវិញ
              </button>
            </div>
          ) : (
            <div id="leaflet-map" ref={mapContainerRef} className="w-full h-full z-10" />
          )}

          {/* Loading Spinner */}
          {!mapLoaded && !loadingError && (
            <div className="absolute inset-0 bg-slate-50/90 z-20 flex flex-col items-center justify-center">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mb-2" />
              <span className="text-sm text-slate-600 font-medium">កំពុងរៀបចំផែនទី GPS...</span>
            </div>
          )}
        </div>
      </div>

      {/* Verification Details Panel (Conditional on select) */}
      {selectedLog ? (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="md:col-span-3 pb-3 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-md flex items-center gap-2">
              <Navigation className="h-5 w-5 text-indigo-600 animate-pulse" />
              ផ្ទាំងផ្ទៀងផ្ទាត់កូអរដោនេចម្ងាយស្កេនលម្អិត (Comparative Coordinates Hub)
            </h3>
            <button
              onClick={() => onSelectLog(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              បិទផ្ទាំង
            </button>
          </div>

          {/* Block 1: Configured Center */}
          <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-50">
            <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              ១. ទីតាំងរៀបចំសិក្ខាសាលា (Workshop Standard)
            </h4>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div><span className="text-slate-400">ឈ្មោះទីតាំង៖</span> <span className="font-semibold text-slate-800">{workshopName}</span></div>
              <div><span className="text-slate-400">កូអរដោនេឡាទីទុយ៖</span> <span className="font-mono text-blue-700">{workshopLat.toFixed(6)}</span></div>
              <div><span className="text-slate-400">កូអរដោនេឡុងហ្ស៊ីទីទុយ៖</span> <span className="font-mono text-blue-700">{workshopLng.toFixed(6)}</span></div>
            </div>
          </div>

          {/* Block 2: Trainee Coordinate */}
          <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-50">
            <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              ២. ទីតាំងស្កេនជាក់ស្តែង (Trainee Actual GPS)
            </h4>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div><span className="text-slate-400">ឈ្មោះសិក្ខាកាម៖</span> <span className="font-semibold text-slate-800">{selectedLog.traineeName} ({selectedLog.studentId})</span></div>
              <div><span className="text-slate-400">ឡាទីទុយជាក់ស្តែង៖</span> <span className="font-mono text-emerald-700">{(selectedLog.latitude || 0).toFixed(6)}</span></div>
              <div><span className="text-slate-400">ឡុងហ្ស៊ីទីទុយជាក់ស្តែង៖</span> <span className="font-mono text-emerald-700">{(selectedLog.longitude || 0).toFixed(6)}</span></div>
            </div>
          </div>

          {/* Block 3: Verification Result */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-slate-500" />
              ៣. លទ្ធផលផ្ទៀងផ្ទាត់ចម្ងាយ (Verification Audit)
            </h4>
            <div className="text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">គម្លាតចម្ងាយ៖</span>
                <span className="font-mono font-bold text-sm text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {selectedDistance !== null ? `${selectedDistance.toFixed(1)} ម៉ែត្រ` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">ស្ថានភាព Geofence (10m)៖</span>
                {selectedDistance !== null && selectedDistance <= 10 ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    អនុញ្ញាត (យល់ព្រម)
                  </span>
                ) : (
                  <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                    បដិសេធ (ក្រៅដែនកំណត់)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center text-slate-500 text-xs">
          💡 សូមជ្រើសរើសសិក្ខាកាមណាម្នាក់ក្នុងបញ្ជីខាងលើ ដើម្បីដំណើរការផ្ទាំងផ្ទៀងផ្ទាត់ចម្ងាយស្កេន និងត្រួតពិនិត្យភាពត្រឹមត្រូវនៃទីតាំង GPS។
        </div>
      )}
    </div>
  );
}
