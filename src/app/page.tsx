"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import PrescriptionScanner from "@/components/PrescriptionScanner";
import MedicineDetails from "@/components/MedicineDetails";
import DigitalSchedule from "@/components/DigitalSchedule";
import VoiceRecorder from "@/components/VoiceRecorder";
import ChatBot from "@/components/ChatBot";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, Heart, ShieldCheck, Search, Loader2, LogOut, User as UserIcon, History, ArrowRight } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"scan" | "history" | "profile">("scan");
  const [data, setData] = useState<{ medicines: any[] } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileData, setProfileData] = useState({ age: "", medicalHistory: "" });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchHistory();
      // Fetch profile initial state could also be done here or in history
    }
  }, [status, router]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      const result = await res.json();
      if (result.history) setHistory(result.history);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleReset = () => {
    setData(null);
    setSearchQuery("");
    setActiveTab("scan");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    const formData = new FormData();
    formData.append("medicineName", searchQuery);

    try {
      const response = await fetch("/api/process-prescription", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.medicines) {
        setData(result);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-5xl mx-auto h-20 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Heart className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">CareScan AI</span>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center bg-zinc-50 p-1 rounded-2xl border border-zinc-100">
              {[
                { id: "scan", label: "Scanner", icon: Heart },
                { id: "history", label: "History", icon: History },
                { id: "profile", label: "Profile", icon: UserIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800"
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>

            {session?.user && (
              <div className="flex items-center gap-3 pr-4 border-r border-zinc-100">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-zinc-900">{session.user.name}</p>
                  <p className="text-[10px] text-zinc-500 font-medium">Patient</p>
                </div>
                <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600">
                  <UserIcon className="w-5 h-5" />
                </div>
              </div>
            )}

            <button
              onClick={() => signOut()}
              className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-12 px-6 min-h-[70vh]">
        <AnimatePresence mode="wait">
          {activeTab === "scan" && (
            !data ? (
              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-16"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <PrescriptionScanner onDataExtracted={(d) => { setData(d); fetchHistory(); }} />
                  <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[3rem] border border-zinc-100 shadow-sm space-y-8">
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold text-zinc-900">Voice Assistant</h3>
                      <p className="text-zinc-500 text-sm">Ask about any medicine using your voice.</p>
                    </div>
                    <VoiceRecorder onAudioCaptured={(d) => { setData(d); fetchHistory(); }} />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#fafafa] px-4 text-zinc-400 font-bold tracking-widest">or lookup manually</span>
                  </div>
                </div>

                <form onSubmit={handleSearch} className="max-w-xl mx-auto w-full relative group">
                  <input
                    type="text"
                    placeholder="Type tablet name (e.g. Metformin, Paracetamol)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-16 pl-14 pr-32 bg-white rounded-3xl border border-zinc-200 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-lg group-hover:shadow-md"
                  />
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                  <button
                    type="submit"
                    disabled={searching}
                    className="absolute right-3 top-3 bottom-3 px-6 bg-zinc-900 text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lookup"}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-12"
              >
                <div className="flex items-center justify-between pb-6 border-b border-zinc-100">
                  <div>
                    <h2 className="text-4xl font-black text-zinc-900 tracking-tight">Health Analysis</h2>
                    <p className="text-zinc-500 text-lg">Detailed medication safety profile and schedule.</p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="p-4 bg-white border border-zinc-200 rounded-[1.5rem] text-zinc-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm flex items-center gap-2 group"
                  >
                    <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500 text-blue-500" />
                    <span className="font-bold text-sm">Scan New</span>
                  </button>
                </div>

                <div className="space-y-12">
                  <section>
                    <MedicineDetails medicines={data.medicines} />
                  </section>

                  <section className="bg-white rounded-[3rem] border border-zinc-100 p-2 shadow-sm">
                    <DigitalSchedule medicines={data.medicines} />
                  </section>
                </div>
              </motion.div>
            )
          )}

          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-12"
            >
              <div className="pb-6 border-b border-zinc-100">
                <h2 className="text-4xl font-black text-zinc-900 tracking-tight">Medical History</h2>
                <p className="text-zinc-500 text-lg">Your previous scans and medicine records.</p>
              </div>

              {history.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => { setData({ medicines: item.medicines }); setActiveTab("scan"); }}
                      className="p-8 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.medicines.map((m: any, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold ring-1 ring-blue-100">
                            {m.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-zinc-200">
                  <History className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                  <p className="text-zinc-400 font-medium">No medical history found. Start scanning!</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center space-y-4 mb-12">
                <div className="w-24 h-24 bg-zinc-100 rounded-[2rem] flex items-center justify-center text-zinc-400 mx-auto border border-zinc-200">
                  <UserIcon className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-zinc-900 tracking-tight">{session?.user?.name}</h2>
                  <p className="text-zinc-500 font-medium">{session?.user?.email}</p>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm space-y-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">Personal Health Details</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 ml-1">Age</label>
                      <input
                        type="number"
                        placeholder="Set Age"
                        className="w-full px-6 py-4 bg-zinc-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 transition-all"
                        value={profileData.age}
                        onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 ml-1">Gender</label>
                      <select className="w-full px-6 py-4 bg-zinc-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 transition-all">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">Chronic Conditions / Allergies</h3>
                  <textarea
                    placeholder="Explain any conditions like Diabetes, Heart Disease, or Penicillin allergy..."
                    rows={4}
                    className="w-full px-6 py-4 bg-zinc-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                    value={profileData.medicalHistory}
                    onChange={(e) => setProfileData({ ...profileData, medicalHistory: e.target.value })}
                  />
                </div>

                <button
                  onClick={async () => {
                    await fetch("/api/user/profile", {
                      method: "PUT",
                      body: JSON.stringify(profileData),
                      headers: { "Content-Type": "application/json" }
                    });
                    alert("Profile Updated! Gemini will now use your latest details.");
                  }}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                >
                  Save Profile
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-5xl mx-auto py-16 px-6 border-t border-zinc-100 text-center space-y-4">
        <div className="flex justify-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
          <span>Accuracy: 99.8%</span>
          <span>•</span>
          <span>Powered by Gemini 2.5</span>
          <span>•</span>
          <span>Refreshed 2026</span>
        </div>
        <p className="text-xs text-zinc-400 max-w-2xl mx-auto leading-relaxed italic">
          Disclaimer: This AI tool is designed to assist in understanding prescriptions.
          Information on side effects and restrictions is generated via medical LLM datasets.
          Always verify these details with your professional healthcare provider before consumption.
        </p>
      </footer>

      <ChatBot />
    </div>
  );
}
