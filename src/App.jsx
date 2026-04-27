import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, LogIn, LogOut, Users, Search, 
  CheckCircle, Circle, XCircle, ArrowLeft, 
  Save, Loader2, AlertCircle, Info 
} from 'lucide-react';

// --- KONFIGURASI API ---
const KC_URL = 'https://id.tif.uin-suska.ac.id/realms/dev/protocol/openid-connect/token';
const API_URL = 'https://api.tif.uin-suska.ac.id/setoran-dev/v1';

export default function App() {
  // State Autentikasi
  const [token, setToken] = useState(null);
  const [dosenData, setDosenData] = useState(null);
  
  // State Navigasi & UI
  const [view, setView] = useState('login'); // 'login', 'dashboard', 'detail'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // State Data Mahasiswa
  const [selectedStudent, setSelectedStudent] = useState(null);

  // --- HELPER UNTUK NOTIFIKASI ---
  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // --- API SERVICES ---
  const handleLogin = async (username, password) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams();
      params.append('client_id', 'setoran-mobile-dev');
      params.append('client_secret', 'aqJp3xnXKudgC7RMOshEQP7ZoVKWzoSl');
      params.append('grant_type', 'password');
      params.append('username', username);
      params.append('password', password);
      params.append('scope', 'openid profile email');

      const response = await fetch(KC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error_description || 'Gagal login. Periksa username dan password.');
      
      setToken(data.access_token);
      await fetchDosenData(data.access_token);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDosenData = async (accessToken) => {
    try {
      const res = await fetch(`${API_URL}/dosen/pa-saya`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const data = await res.json();
      if (!data.response) throw new Error(data.message);
      
      setDosenData(data.data);
      setView('dashboard');
    } catch (err) {
      showError(err.message);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setDosenData(null);
    setView('login');
    setSelectedStudent(null);
  };

  // --- VIEWS ROUTING ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Notifikasi Toast */}
      {errorMsg && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{errorMsg}</p>
        </div>
      )}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded shadow-lg flex items-center gap-3">
          <CheckCircle size={20} />
          <p>{successMsg}</p>
        </div>
      )}

      {/* Header */}
      {view !== 'login' && (
        <header className="bg-emerald-700 text-white shadow-md sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="text-emerald-300" />
              <h1 className="text-xl font-bold">Setoran Hafalan TIF</h1>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="hidden sm:inline-block">👤 {dosenData?.nama}</span>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 px-3 py-1.5 rounded transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 md:p-6">
        <h1 className="text-3xl text-emerald-600">ACMAD FERDY</h1>
        {view === 'login' && <LoginView onLogin={handleLogin} loading={loading} />}
        {view === 'dashboard' && <DashboardView dosenData={dosenData} onSelectStudent={(mhs) => { setSelectedStudent(mhs); setView('detail'); }} />}
        {view === 'detail' && <DetailView nim={selectedStudent?.nim} token={token} onBack={() => setView('dashboard')} showError={showError} showSuccess={showSuccess} />}
      </main>
    </div>
  );
}

// ==========================================
// 1. LOGIN VIEW
// ==========================================
function LoginView({ onLogin, loading }) {
  const [username, setUsername] = useState('muhammad.fikri@uin-suska.ac.id');
  const [password, setPassword] = useState('muhammad.fikri');

  const onSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <BookOpen size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Login Dosen PA</h2>
          <p className="text-slate-500 text-sm mt-1 text-center">Masuk untuk mencatat setoran hafalan mahasiswa bimbingan Anda.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username (Email)</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="email@uin-suska.ac.id"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 2. DASHBOARD VIEW (Daftar Mahasiswa PA)
// ==========================================
function DashboardView({ dosenData, onSelectStudent }) {
  const [search, setSearch] = useState('');
  
  const mahasiswaList = dosenData?.info_mahasiswa_pa?.daftar_mahasiswa || [];
  
  const filteredMahasiswa = useMemo(() => {
    return mahasiswaList.filter(m => 
      m.nama.toLowerCase().includes(search.toLowerCase()) || 
      m.nim.includes(search)
    );
  }, [search, mahasiswaList]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Daftar Mahasiswa PA</h2>
          <p className="text-slate-500">Pilih mahasiswa untuk mengelola setoran hafalan.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari Nama / NIM..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMahasiswa.map((mhs) => (
          <div 
            key={mhs.nim} 
            onClick={() => onSelectStudent(mhs)}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 cursor-pointer transition-all flex flex-col h-full group"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{mhs.nama}</h3>
                <p className="text-sm text-slate-500 font-mono">{mhs.nim}</p>
              </div>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-medium">
                Akt {mhs.angkatan}
              </span>
            </div>
            
            <div className="mt-auto pt-4 border-t border-slate-100">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progres Hafalan</span>
                <span className="font-semibold text-emerald-600">{mhs.info_setoran.persentase_progres_setor}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-2 rounded-full" 
                  style={{ width: `${mhs.info_setoran.persentase_progres_setor}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Disetor: {mhs.info_setoran.total_sudah_setor} / {mhs.info_setoran.total_wajib_setor} Surat
              </p>
            </div>
          </div>
        ))}
        {filteredMahasiswa.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
            <Users className="mx-auto text-slate-300 mb-2" size={32} />
            <p>Tidak ada mahasiswa yang sesuai dengan pencarian.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. DETAIL VIEW (Kelola Setoran)
// ==========================================
function DetailView({ nim, token, onBack, showError, showSuccess }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedToSave, setSelectedToSave] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSetoran = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/mahasiswa/setoran/${nim}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (!result.response) throw new Error(result.message);
      setData(result.data);
      setSelectedToSave([]); // reset selection
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSetoran();
  }, [nim]);

  const handleCheckboxChange = (surah) => {
    setSelectedToSave(prev => {
      const exists = prev.find(item => item.id_komponen_setoran === surah.id);
      if (exists) {
        return prev.filter(item => item.id_komponen_setoran !== surah.id);
      } else {
        return [...prev, {
          id_komponen_setoran: surah.id,
          nama_komponen_setoran: surah.nama
        }];
      }
    });
  };

  const handleSave = async () => {
    if (selectedToSave.length === 0) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/mahasiswa/setoran/${nim}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data_setoran: selectedToSave })
      });
      const result = await res.json();
      if (!result.response) throw new Error(result.message);
      
      showSuccess(result.message);
      await fetchSetoran(); // Reload data
    } catch (err) {
      showError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (surah) => {
    if (!window.confirm(`Yakin ingin membatalkan setoran ${surah.nama}?`)) return;
    
    setIsProcessing(true);
    try {
      const payload = {
        data_setoran: [{
          id: surah.info_setoran.id,
          id_komponen_setoran: surah.id,
          nama_komponen_setoran: surah.nama
        }]
      };

      const res = await fetch(`${API_URL}/mahasiswa/setoran/${nim}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (!result.response) throw new Error(result.message);
      
      showSuccess(result.message);
      await fetchSetoran(); // Reload data
    } catch (err) {
      showError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Memuat data setoran...</p>
      </div>
    );
  }

  if (!data) return null;

  const info = data.info;
  const stat = data.setoran.info_dasar;
  const listSurah = data.setoran.detail;

  // Grouping surah by Label (KP, SEMPRO, dll)
  const groupedSurah = listSurah.reduce((acc, surah) => {
    if (!acc[surah.label]) acc[surah.label] = [];
    acc[surah.label].push(surah);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Header Info Mahasiswa */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-emerald-600 mb-4 text-sm font-medium transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Kembali ke Daftar
        </button>
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{info.nama}</h2>
            <p className="text-slate-500">{info.nim} • Semester {info.semester}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex gap-6 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Sudah Disetor</p>
              <p className="text-xl font-bold text-emerald-600">{stat.total_sudah_setor} <span className="text-sm font-normal text-slate-500">/ {stat.total_wajib_setor}</span></p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Progres</p>
              <p className="text-xl font-bold text-emerald-600">{stat.persentase_progres_setor}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daftar Surah (Dikelompokkan) */}
      <div className="space-y-8 pb-24">
        {Object.entries(groupedSurah).map(([label, surahs]) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-700">Tahap: {label.replace('_', ' ', 'info.nama')}</h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-medium">
                {surahs.filter(s => s.sudah_setor).length} / {surahs.length} Selesai
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {surahs.map((surah) => {
                const isSelected = selectedToSave.some(item => item.id_komponen_setoran === surah.id);
                return (
                  <div key={surah.id} className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${isSelected ? 'bg-emerald-50/50' : ''}`}>
                    <div className="flex items-center gap-4">
                      {/* Checkbox (Jika belum disetor) */}
                      {!surah.sudah_setor ? (
                        <button 
                          onClick={() => handleCheckboxChange(surah)}
                          className={`flex-shrink-0 w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-transparent hover:border-emerald-400'
                          }`}
                        >
                          <CheckCircle size={18} className={isSelected ? 'block' : 'hidden'} />
                        </button>
                      ) : (
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <CheckCircle size={16} />
                        </div>
                      )}
                      
                      <div>
                        <p className="font-semibold text-slate-800">{surah.nama} <span className="text-sm font-normal text-slate-400 ml-2">({surah.nama_arab})</span></p>
                        {surah.sudah_setor && surah.info_setoran && (
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <CheckCircle size={12} className="text-emerald-500"/>
                            Divalidasi {surah.info_setoran.tgl_validasi}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tombol Batalkan (Jika sudah disetor) */}
                    {surah.sudah_setor && (
                      <button 
                        onClick={() => handleDelete(surah)}
                        disabled={isProcessing}
                        className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                      >
                        Batalkan
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Bar (Muncul jika ada checkbox yang dipilih) */}
      {selectedToSave.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 z-50">
          <div className="flex items-center gap-2">
            <Info size={18} className="text-emerald-400" />
            <span className="font-medium">{selectedToSave.length} Surah Terpilih</span>
          </div>
          <button 
            onClick={handleSave}
            disabled={isProcessing}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full font-medium flex items-center gap-2 transition-colors disabled:opacity-70"
          >
            {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isProcessing ? 'Menyimpan...' : 'Validasi Setoran'}
          </button>
        </div>
      )}
    </div>
  );
}