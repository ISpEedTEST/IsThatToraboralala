"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Track } from "@/types";

export default function Dashboard() {
  const { data: session } = useSession();
  const [library, setLibrary] = useState<Track[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState(""); // 👈 حالة الاسم المخصص
  const [loading, setLoading] = useState(false);

  // جلب البيانات
  const fetchLibrary = async () => {
    const res = await fetch("/api/library");
    if (res.ok) {
      const data = await res.json();
      setLibrary(data);
    }
  };

  useEffect(() => {
    if (session) fetchLibrary();
  }, [session]);

  // برمجة زر الرفع
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("الرجاء اختيار ملف صوتي!");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("customName", customName); // 👈 إرسال الاسم

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      setFile(null);
      setCustomName("");
      await fetchLibrary();
    } else {
      alert("حدث خطأ أثناء الرفع");
    }
    setLoading(false);
  };

// دالة الحذف
const handleDelete = async (trackPath: string) => {
  if (!confirm("هل أنت متأكد من حذف هذا المقطع؟ لا يمكن التراجع!")) return;
  
  const res = await fetch("/api/library", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // 👈 تأكد من أننا نرسل المتغير باسم trackPath
    body: JSON.stringify({ action: "DELETE", trackPath: trackPath }), 
  });
  
  if (res.ok) fetchLibrary();
  else alert("حدث خطأ أثناء الحذف، تأكد من مسار الملف.");
};

// دالة التعديل
const handleEdit = async (trackPath: string, oldName: string) => {
  const newName = prompt("أدخل الاسم الجديد للمقطع:", oldName);
  if (newName && newName.trim() !== "" && newName !== oldName) {
    const res = await fetch("/api/library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // 👈 تأكد من أننا نرسل المتغير باسم trackPath
      body: JSON.stringify({ action: "EDIT", trackPath: trackPath, newName: newName }),
    });
    if (res.ok) fetchLibrary();
    else alert("حدث خطأ أثناء التعديل.");
  }
};


  // شاشة تسجيل الدخول
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white gap-8 px-4 text-center">
        <div className="bg-gray-800/50 p-10 rounded-3xl border border-gray-700/50 shadow-2xl backdrop-blur-md max-w-md w-full">
          <div className="text-6xl mb-6">🎧</div>
          <h1 className="text-3xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            مكتبتك الصوتية
          </h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            ارفع مقاطعك الخاصة، عدلها، وشغلها مباشرة عبر بوت الديسكورد الخاص بك.
          </p>
          <button 
            onClick={() => signIn("discord")}
            className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-[#5865F2]/30 active:scale-95"
          >
            تسجيل الدخول عبر Discord
          </button>
        </div>
      </div>
    );
  }

  // لوحة التحكم الأساسية
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-[#111827] to-black text-white p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* الترويسة (الهيدر) */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-gray-800/40 p-6 rounded-3xl border border-gray-700/50 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-5 mb-4 md:mb-0">
            <div className="relative">
              <img src={session.user?.image || ""} alt="avatar" className="w-16 h-16 rounded-2xl border-2 border-indigo-500/50 shadow-lg object-cover" />
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-4 h-4 rounded-full border-2 border-gray-800"></div>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">مرحباً بعودتك،</p>
              <h2 className="text-2xl font-bold text-white">{session.user?.name}</h2>
            </div>
          </div>
          <button 
            onClick={() => signOut()} 
            className="text-gray-400 hover:text-red-400 font-semibold bg-gray-900/50 px-6 py-2.5 rounded-xl border border-gray-700 hover:border-red-500/50 transition-all"
          >
            تسجيل الخروج
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* قسم الرفع */}
          <section className="lg:col-span-1 bg-gray-800/40 p-6 md:p-8 rounded-3xl border border-gray-700/50 shadow-xl backdrop-blur-md h-fit">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">📤</span>
              <h3 className="text-xl font-bold">رفع مقطع جديد</h3>
            </div>

            <form onSubmit={handleUpload} className="space-y-5">
  <div>
    <label className="block text-sm text-gray-400 mb-2 ml-1">اسم المقطع (إجباري) *</label>
    <input 
      type="text" 
      required 
      disabled={loading} // 👈 تعطيل حقل الاسم أثناء الرفع
      placeholder="أدخل اسماً للمقطع..."
      value={customName}
      onChange={(e) => setCustomName(e.target.value)}
      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
    />
  </div>

  <div>
    <label className="block text-sm text-gray-400 mb-2 ml-1">الملف الصوتي *</label>
    <input 
      type="file" 
      required 
      accept="audio/*" 
      disabled={loading} // 👈 تعطيل زر اختيار الملف أثناء الرفع
      onChange={(e) => setFile(e.target.files?.[0] || null)}
      className="block w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    />
  </div>

  <button 
    disabled={loading || !file || !customName.trim()} 
    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 mt-4"
  >
    {/* 👈 تغيير النص لتوضيح حالة الرفع */}
    {loading ? "⏳ جاري الرفع... الرجاء الانتظار" : "بدء الرفع"}
  </button>
</form>


          </section>

          {/* قسم المكتبة */}
          <section className="lg:col-span-2 bg-gray-800/40 p-6 md:p-8 rounded-3xl border border-gray-700/50 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📁</span>
                <h3 className="text-xl font-bold">ملفاتك المرفوعة</h3>
              </div>
              <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-sm font-bold border border-indigo-500/30">
                {library.length} مقطع
              </span>
            </div>

            <div className="space-y-3">
              {library.map((track, index) => (
                <div key={track.id || index} className="group flex flex-col sm:flex-row sm:items-center justify-between bg-gray-900/40 p-4 rounded-2xl border border-gray-700/50 hover:border-indigo-500/50 hover:bg-gray-800/60 transition-all gap-4">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="bg-indigo-500/10 p-3 rounded-xl text-indigo-400 shrink-0">
                      🎵
                    </div>
                    <span className="font-semibold text-gray-200 truncate">{track.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                  <button 
  onClick={() => handleEdit(track.path, track.name)} // 👈 نرسل المسار والاسم
  className="bg-gray-800 hover:bg-blue-600/20 text-gray-400 hover:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-all"
>
  ✏️ تعديل
</button>
<button 
  onClick={() => handleDelete(track.path)} // 👈 نرسل المسار
  className="bg-gray-800 hover:bg-red-600/20 text-gray-400 hover:text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-all"
>
  🗑️ حذف
</button> 
                  </div>
                </div>
              ))}
              
              {library.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-700/50 rounded-3xl">
                  <span className="text-4xl mb-4 opacity-50">📭</span>
                  <p className="text-gray-400 font-medium">مكتبتك فارغة تماماً.</p>
                  <p className="text-gray-500 text-sm mt-1">ابدأ برفع بعض المقاطع من القائمة الجانبية!</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}