"use client";

import { motion } from "framer-motion";
import { Pill, Activity, Apple, FileText, ChevronRight, ExternalLink } from "lucide-react";

export default function HealthResources({ onDrugInfoClick, onEmergencyClick, onSymptomClick, onDietClick, onArticleClick }: { onDrugInfoClick?: () => void, onEmergencyClick?: () => void, onSymptomClick?: () => void, onDietClick?: () => void, onArticleClick?: () => void }) {
    const resources = [
        { title: "Drug Information", desc: "Detailed breakdown of 10k+ meds", icon: Pill, color: "bg-blue-50 text-blue-600", onClick: onDrugInfoClick },
        { title: "Symptom Checker", desc: "AI-driven wellness analysis", icon: Activity, color: "bg-purple-50 text-purple-600", onClick: onSymptomClick },
        { title: "Diet & Nutrition", desc: "Patient-specific diet plans", icon: Apple, color: "bg-green-50 text-green-600", onClick: onDietClick },
        { title: "Health Articles", desc: "Verified medical research", icon: FileText, color: "bg-amber-50 text-amber-600", onClick: onArticleClick },
    ];

    return (
        <aside className="w-80 bg-zinc-50 border-l border-zinc-100 p-8 space-y-10 h-full sticky top-0 overflow-y-auto hidden xl:block">
            <div>
                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-6">Health Resources</h3>
                <div className="space-y-4">
                    {resources.map((res, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ x: 4 }}
                            onClick={res.onClick}
                            className={`p-5 bg-white rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-all cursor-pointer group ${res.onClick ? 'active:scale-95' : ''}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-2xl ${res.color}`}>
                                    <res.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-zinc-900 mb-1">{res.title}</h4>
                                    <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">{res.desc}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 mt-1" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div
                onClick={onEmergencyClick}
                className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2rem] text-white space-y-4 shadow-xl shadow-blue-100 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                </div>
                <h4 className="font-bold">Medical Emergency?</h4>
                <p className="text-xs text-blue-50 opacity-80 leading-relaxed">
                    If you are experiencing a medical emergency, please contact your local emergency services immediately (911).
                </p>
                <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                    Emergency Protocols
                    <ExternalLink className="w-3 h-3" />
                </button>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
                <h4 className="text-xs font-bold text-zinc-900 mb-4">Daily Wellness Tip</h4>
                <p className="text-[11px] text-zinc-500 italic leading-relaxed">
                    "Drinking a glass of water before every meal helps in better digestion and metabolic regulation."
                </p>
            </div>
        </aside>
    );
}
