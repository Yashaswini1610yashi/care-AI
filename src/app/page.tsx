"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import HealthResources from "@/components/HealthResources";
import ChatBot from "@/components/ChatBot";
import MedicineDetails from "@/components/MedicineDetails";
import DigitalSchedule from "@/components/DigitalSchedule";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, Heart, History, User as UserIcon, ArrowRight, Pill, Activity, Settings, Search, LayoutDashboard, FileText, ShieldCheck, Volume2, X, Bot, Phone, Mail, AlertTriangle, Info, Apple } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"scan" | "history" | "profile" | "settings">("scan");
  const [data, setData] = useState<{ medicines: any[] } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [profileData, setProfileData] = useState({ age: "", medicalHistory: "", doctorName: "", doctorPhone: "", doctorEmail: "" });
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const [showDietPlan, setShowDietPlan] = useState(false);
  const [showHealthArticles, setShowHealthArticles] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchHistory();
      fetchProfile();
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

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const result = await res.json();
      if (result.user) {
        setProfileData({
          age: result.user.age?.toString() || "",
          medicalHistory: result.user.medicalHistory || "",
          doctorName: result.user.doctorName || "",
          doctorPhone: result.user.doctorPhone || "",
          doctorEmail: result.user.doctorEmail || ""
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  if (status === "loading") {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#FAFBFF]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
            <Heart className="w-7 h-7 text-white animate-pulse" fill="currentColor" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Loading MediBot...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FAFBFF] font-sans selection:bg-blue-100 selection:text-blue-900 relative">
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col min-w-0">
        <AnimatePresence mode="wait">
          {activeTab === "scan" && (
            <motion.div
              key="chat-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full"
            >
              {/* Central Chat Column - Now Full Width */}
              <div className="flex-1 flex flex-col h-full border-r border-zinc-100">
                <ChatBot onResultsFound={setData} />
              </div>
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-12 space-y-12 overflow-y-auto scrollbar-hide"
            >
              <div className="max-w-4xl mx-auto space-y-12">
                <div className="space-y-2">
                  <h2 className="text-4xl font-black text-zinc-900 tracking-tight">Prescription Vault</h2>
                  <p className="text-zinc-500 text-lg font-medium italic">A temporal record of your medical consultations.</p>
                </div>

                {history.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => { setData({ medicines: item.medicines }); setActiveTab("scan"); }}
                        className="p-8 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-xl">
                              <FileText className="w-4 h-4 text-blue-500" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                              {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <ArrowRight className="w-5 h-5 text-zinc-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.medicines.map((m: any, idx: number) => (
                            <span key={idx} className="px-4 py-1.5 bg-zinc-50 text-zinc-900 rounded-full text-[11px] font-black uppercase tracking-tighter ring-1 ring-zinc-100">
                              {m.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-zinc-50 flex flex-col items-center justify-center space-y-6">
                    <History className="w-16 h-16 text-zinc-100" />
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-zinc-300">Vault is Empty</p>
                      <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Start a new conversation to save records.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-12 overflow-y-auto"
            >
              <div className="max-w-2xl mx-auto space-y-12">
                <div className="text-center space-y-6 pb-6 border-b border-zinc-100">
                  <div className="w-32 h-32 bg-blue-50 rounded-[3rem] flex items-center justify-center text-blue-600 mx-auto border-4 border-white shadow-xl relative">
                    <UserIcon className="w-14 h-14" />
                    <div className="absolute -bottom-2 -right-2 bg-zinc-900 text-white p-3 rounded-2xl shadow-lg">
                      <Settings className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-zinc-900 tracking-tight">{session?.user?.name}</h2>
                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-1">{session?.user?.email}</p>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-xl shadow-blue-900/5 space-y-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Personal Health Profile</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Patient Age</label>
                        <input
                          type="number"
                          placeholder="Set Age"
                          className="w-full h-14 px-6 bg-zinc-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all"
                          value={profileData.age}
                          onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Patient Gender</label>
                        <select className="w-full h-14 px-6 bg-zinc-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer">
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Allergies & Medical History</label>
                    <textarea
                      placeholder="e.g., Type 2 Diabetes, Penicillin Allergy, High Blood Pressure..."
                      rows={4}
                      className="w-full p-6 bg-zinc-50 border-none rounded-3xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                      value={profileData.medicalHistory}
                      onChange={(e) => setProfileData({ ...profileData, medicalHistory: e.target.value })}
                    />
                  </div>

                  {/* Emergency Doctor Contact Section */}
                  <div className="space-y-6 pt-6 border-t border-zinc-50">
                    <div className="flex items-center gap-3">
                      <Bot className="w-5 h-5 text-blue-600" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Emergency Doctor Contact</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Doctor's Name</label>
                        <input
                          type="text"
                          placeholder="Dr. Smith"
                          className="w-full h-14 px-6 bg-zinc-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all"
                          value={profileData.doctorName}
                          onChange={(e) => setProfileData({ ...profileData, doctorName: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Doctor's Phone</label>
                          <input
                            type="tel"
                            placeholder="+1 234 567 890"
                            className="w-full h-14 px-6 bg-zinc-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all"
                            value={profileData.doctorPhone}
                            onChange={(e) => setProfileData({ ...profileData, doctorPhone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Doctor's Gmail</label>
                          <input
                            type="email"
                            placeholder="doctor@gmail.com"
                            className="w-full h-14 px-6 bg-zinc-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all"
                            value={profileData.doctorEmail}
                            onChange={(e) => setProfileData({ ...profileData, doctorEmail: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await fetch("/api/user/profile", {
                        method: "PUT",
                        body: JSON.stringify(profileData),
                        headers: { "Content-Type": "application/json" }
                      });
                      alert("Health Profile Synced with MediBot AI!");
                    }}
                    className="w-full h-16 bg-blue-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    Sync Health Data
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-12 space-y-12 max-w-2xl mx-auto"
            >
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-zinc-900 tracking-tight">App Settings</h2>
                <p className="text-zinc-500 text-lg font-medium italic">Configure your MediBot experience.</p>
              </div>

              <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-zinc-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-50 rounded-2xl">
                      <ShieldCheck className="w-6 h-6 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">Privacy Mode</p>
                      <p className="text-xs text-zinc-400 font-medium">Auto-delete history after 30 days</p>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>

                <div className="p-8 border-b border-zinc-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-50 rounded-2xl">
                      <Volume2 className="w-6 h-6 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">Voice Assistant</p>
                      <p className="text-xs text-zinc-400 font-medium">Enable AI voice feedback</p>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-zinc-200 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>

                <div className="p-8 bg-zinc-50/50">
                  <button className="w-full py-4 bg-white border border-red-100 text-red-500 rounded-2xl font-bold text-sm hover:bg-red-50 transition-all">
                    Deactivate Account
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <HealthResources
        onDrugInfoClick={() => setShowAnalysis(true)}
        onEmergencyClick={() => setShowEmergency(true)}
        onSymptomClick={() => setShowSymptomChecker(true)}
        onDietClick={() => setShowDietPlan(true)}
        onArticleClick={() => setShowHealthArticles(true)}
      />

      {/* Full Page Symptom Checker Modal */}
      <AnimatePresence>
        {showSymptomChecker && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[70] bg-[#FAFBFF] flex flex-col"
          >
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-100">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">AI Symptom & Drug Analysis</h3>
                  <p className="text-sm text-zinc-500 font-medium italic">Understanding medication purpose and disease targeting</p>
                </div>
              </div>
              <button
                onClick={() => setShowSymptomChecker(false)}
                className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center hover:bg-zinc-100 transition-colors border border-zinc-100"
              >
                <X className="w-6 h-6 text-zinc-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12">
              <div className="max-w-5xl mx-auto space-y-12">
                {data?.medicines && data.medicines.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {data.medicines.map((med: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-xl shadow-purple-900/5 space-y-6 group hover:border-purple-200 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                              <Pill className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="text-xl font-black text-zinc-900">{med.name}</h4>
                              <p className="text-xs text-purple-500 font-black uppercase tracking-widest">{med.dosage}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Used For / Target Disease</h5>
                            <p className="text-zinc-700 font-bold leading-relaxed">
                              {med.purpose || "Information not specified in scan."}
                            </p>
                          </div>

                          <div className="flex items-start gap-3 px-4">
                            <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-zinc-500 font-medium leading-relaxed italic">
                              {med.explanation}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 space-y-6 opacity-50">
                    <div className="w-24 h-24 bg-zinc-100 rounded-[3rem] flex items-center justify-center text-zinc-300">
                      <Activity className="w-10 h-10" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-zinc-900">No Medication Data Found</h3>
                      <p className="text-zinc-500 mt-2">Scan a prescription first to analyze medication purposes.</p>
                      <button
                        onClick={() => { setShowSymptomChecker(false); setActiveTab("scan"); }}
                        className="mt-6 px-8 py-3 bg-purple-600 text-white rounded-2xl font-bold text-sm hover:bg-purple-700 transition-all shadow-lg shadow-purple-100"
                      >
                        Go to Scanner
                      </button>
                    </div>
                  </div>
                )}

                {/* Patient Context Footer */}
                {profileData.medicalHistory && (
                  <div className="bg-indigo-50 rounded-[3rem] p-10 border border-indigo-100 flex items-start gap-6">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
                      <Bot className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-black text-indigo-900 uppercase tracking-widest text-xs">AI Context Analysis</h5>
                      <p className="text-indigo-800/70 text-sm leading-relaxed font-medium">
                        Based on your history of <span className="text-indigo-900 font-bold">{profileData.medicalHistory}</span>, these medications have been analyzed for compatibility and target symptoms.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Page Emergency Modal */}
      <AnimatePresence>
        {showEmergency && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] bg-white flex flex-col"
          >
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-100">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Medical Emergency</h3>
                  <p className="text-sm text-zinc-500 font-medium italic">Instant protocol and doctor contact</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmergency(false)}
                className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center hover:bg-zinc-100 transition-colors border border-zinc-100"
              >
                <X className="w-6 h-6 text-zinc-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#FAFBFF] p-8 md:p-12">
              <div className="max-w-4xl mx-auto space-y-12">
                {/* Emergency Guidance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-10 bg-red-600 rounded-[3rem] text-white shadow-2xl shadow-red-200 space-y-6">
                    <h4 className="text-2xl font-black italic">Emergency Protocol</h4>
                    <p className="text-red-50 leading-relaxed opacity-90">
                      If the patient is unconscious, having difficulty breathing, or experiencing severe pain, contact emergency services immediately.
                    </p>
                    <div className="pt-4">
                      <a href="tel:911" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-red-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-50 transition-all shadow-xl">
                        <Phone className="w-4 h-4" />
                        Dial 911 Now
                      </a>
                    </div>
                  </div>

                  <div className="p-10 bg-white rounded-[3rem] border border-zinc-100 shadow-xl space-y-8">
                    <h4 className="text-xl font-black text-zinc-900">Personal Doctor</h4>
                    {profileData.doctorName ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                            <Bot className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Primary Physician</p>
                            <p className="text-lg font-bold text-zinc-900">{profileData.doctorName}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {profileData.doctorPhone && (
                            <a href={`tel:${profileData.doctorPhone}`} className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-blue-200 transition-all group">
                              <Phone className="w-5 h-5 text-zinc-400 group-hover:text-blue-500" />
                              <span className="font-bold text-zinc-700">{profileData.doctorPhone}</span>
                            </a>
                          )}
                          {profileData.doctorEmail && (
                            <a
                              href={`mailto:${profileData.doctorEmail}?subject=Medical Emergency - ${session?.user?.name || "Patient"}&body=Hello ${profileData.doctorName}, %0D%0A%0D%0AI am experiencing a medical situation and need your urgent advice. %0D%0A%0D%0APatient Context: ${profileData.medicalHistory || "None specified"}`}
                              className="flex items-center gap-4 p-4 bg-blue-600 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                            >
                              <Mail className="w-5 h-5 text-white" />
                              <span className="font-bold text-white">Email Doctor Directly</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 space-y-4">
                        <p className="text-zinc-400 text-sm font-medium">No personal doctor info saved.</p>
                        <button
                          onClick={() => { setShowEmergency(false); setActiveTab("profile"); }}
                          className="px-6 py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold text-xs hover:bg-zinc-200 transition-all"
                        >
                          Update Profile
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Important Notes */}
                <div className="bg-amber-50 rounded-[3rem] p-10 border border-amber-100 flex items-start gap-6">
                  <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                    <Activity className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-black text-amber-900 uppercase tracking-widest text-xs">Medical Disclaimer</h5>
                    <p className="text-amber-800/70 text-sm leading-relaxed font-medium">
                      MediBot AI provides emergency assistance based on stored data. This is not a substitute for professional medical judgment. Always prioritize immediate human consultation in life-threatening situations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Page Diet & Nutrition Modal */}
      <AnimatePresence>
        {showDietPlan && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[70] bg-[#FBFCFF] flex flex-col"
          >
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-100">
                  <Apple className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">AI Diet & Nutrition Advisor</h3>
                  <p className="text-sm text-zinc-500 font-medium italic">Personalized dietary guidelines based on your medications</p>
                </div>
              </div>
              <button
                onClick={() => setShowDietPlan(false)}
                className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center hover:bg-zinc-100 transition-colors border border-zinc-100"
              >
                <X className="w-6 h-6 text-zinc-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12">
              <div className="max-w-5xl mx-auto space-y-12">
                {data?.medicines && data.medicines.length > 0 ? (
                  <div className="grid grid-cols-1 gap-8">
                    {data.medicines.map((med: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-[3rem] border border-zinc-100 shadow-xl overflow-hidden flex flex-col md:flex-row"
                      >
                        <div className="p-8 md:w-1/3 bg-zinc-50 flex flex-col justify-center border-r border-zinc-100">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                              <Pill className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-black text-zinc-900">{med.name}</h4>
                          </div>
                          <p className="text-xs text-zinc-500 font-medium leading-relaxed italic">
                            {med.explanation}
                          </p>
                        </div>

                        <div className="p-8 flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                <Activity className="w-4 h-4" />
                              </div>
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Dietary Recommendation</h5>
                            </div>
                            <p className="text-zinc-700 font-bold leading-relaxed bg-green-50/30 p-4 rounded-2xl border border-green-100/50">
                              {med.dietaryPlan || "Maintain a balanced diet and stay hydrated."}
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Foods to Avoid</h5>
                            </div>
                            <p className="text-red-700 font-bold leading-relaxed bg-red-50/30 p-4 rounded-2xl border border-red-100/50">
                              {med.restrictedFoods || "No specific food restrictions identified."}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 space-y-6 opacity-50">
                    <div className="w-24 h-24 bg-zinc-100 rounded-[3rem] flex items-center justify-center text-zinc-300">
                      <Apple className="w-10 h-10" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-zinc-900">No Dietary Data Found</h3>
                      <p className="text-zinc-500 mt-2">Scan a prescription first to see dietary guidelines.</p>
                      <button
                        onClick={() => { setShowDietPlan(false); setActiveTab("scan"); }}
                        className="mt-6 px-8 py-3 bg-green-600 text-white rounded-2xl font-bold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-100"
                      >
                        Go to Scanner
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Page Health Articles & Home Remedies Modal */}
      <AnimatePresence>
        {showHealthArticles && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[70] bg-[#FFFBF5] flex flex-col"
          >
            <div className="p-8 border-b border-orange-100 flex items-center justify-between bg-white/60 backdrop-blur-xl sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-100">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">AI Home Remedies & Natural Care</h3>
                  <p className="text-sm text-zinc-500 font-medium italic">Traditional wisdom meets AI analysis for holistic wellness</p>
                </div>
              </div>
              <button
                onClick={() => setShowHealthArticles(false)}
                className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center hover:bg-zinc-100 transition-colors border border-zinc-100"
              >
                <X className="w-6 h-6 text-zinc-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12">
              <div className="max-w-4xl mx-auto space-y-16 pb-24">
                {data?.medicines && data.medicines.length > 0 ? (
                  <div className="space-y-12">
                    {data.medicines.map((med: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.15 }}
                        className="relative group"
                      >
                        {/* Medicine Title Card */}
                        <div className="mb-6 flex items-baseline gap-3">
                          <h4 className="text-3xl font-black text-zinc-900 tracking-tight">{med.name}</h4>
                          <span className="text-xs font-black uppercase tracking-widest text-amber-500">Care Guide</span>
                        </div>

                        {/* Remedy Content */}
                        <div className="p-10 bg-white rounded-[4rem] border border-orange-100 shadow-2xl shadow-orange-900/5 transition-all group-hover:shadow-orange-900/10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                                  <Heart className="w-5 h-5" />
                                </div>
                                <h5 className="text-sm font-black uppercase tracking-widest text-zinc-800">Home Remedies</h5>
                              </div>
                              <p className="text-lg font-medium text-zinc-600 leading-relaxed italic border-l-4 border-amber-200 pl-6">
                                "{med.homeRemedies || "Gentle rest and adequate hydration are recommended."}"
                              </p>
                            </div>

                            <div className="space-y-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400">
                                  <ShieldCheck className="w-5 h-5" />
                                </div>
                                <h5 className="text-sm font-black uppercase tracking-widest text-zinc-800">Safety First</h5>
                              </div>
                              <p className="text-sm text-zinc-500 leading-relaxed font-semibold">
                                Home remedies are intended to complement, not replace, {med.name}. Always monitor your symptoms closely.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 space-y-6 opacity-50">
                    <div className="w-24 h-24 bg-amber-50 rounded-[3rem] flex items-center justify-center text-amber-200">
                      <FileText className="w-10 h-10" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-zinc-900">No Articles Available</h3>
                      <p className="text-zinc-500 mt-2">Scan a prescription to generate personalized home remedies.</p>
                      <button
                        onClick={() => { setShowHealthArticles(false); setActiveTab("scan"); }}
                        className="mt-6 px-8 py-3 bg-amber-600 text-white rounded-2xl font-bold text-sm hover:bg-amber-700 transition-all shadow-lg shadow-amber-100"
                      >
                        Open Wellness Hub
                      </button>
                    </div>
                  </div>
                )}

                {/* Holistic Footer */}
                <div className="p-10 bg-zinc-900 rounded-[4rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl">
                  <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center shrink-0">
                    <Activity className="w-10 h-10 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black mb-2">Integrative Health Approach</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                      MediBot combines pharmaceutical science with safe home-based interventions.
                      If symptoms persist or worsen despite remedies, consult Dr. {profileData.doctorName || "your physician"} immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Page Analysis Modal */}
      <AnimatePresence>
        {showAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-white flex flex-col"
          >
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900 tracking-tight">Health Analysis</h3>
                  <p className="text-xs text-zinc-500 font-medium">Detailed breakdown and schedule</p>
                </div>
              </div>
              <button
                onClick={() => setShowAnalysis(false)}
                className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#FAFBFF] p-8">
              <div className="max-w-5xl mx-auto">
                {data ? (
                  <div className="space-y-12 pb-12">
                    <MedicineDetails medicines={data.medicines} />
                    <div className="p-8 bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl">
                      <h4 className="text-xl font-black text-zinc-900 mb-8 ml-2">Medication Schedule</h4>
                      <DigitalSchedule medicines={data.medicines} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 space-y-6 opacity-50">
                    <div className="w-24 h-24 bg-zinc-100 rounded-[3rem] flex items-center justify-center text-zinc-300">
                      <Pill className="w-10 h-10" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-zinc-900">No Active Analysis</h3>
                      <p className="text-zinc-500 mt-2">Scan a prescription or consult the chatbot to see details here.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
