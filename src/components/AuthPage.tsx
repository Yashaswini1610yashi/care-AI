"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Phone, ArrowRight, Loader2, Heart } from "lucide-react";
import Link from "next/link";

export default function AuthPage({ mode }: { mode: "login" | "signup" }) {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        phoneNumber: "",
        age: "",
    });
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email }),
            });

            if (res.ok) {
                setResetEmailSent(true);
            } else {
                throw new Error("Failed to send reset email");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (isForgotPassword) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-sans">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                                <Heart className="w-7 h-7 text-white" fill="currentColor" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Recover Account</h2>
                        <p className="text-zinc-500">Enter your email to receive a password reset link.</p>
                    </div>

                    <div className="bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-sm space-y-6">
                        {!resetEmailSent ? (
                            <form onSubmit={handleForgotPassword} className="space-y-6">
                                <div className="space-y-1 group">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="email"
                                            required
                                            placeholder="Enter your registered email"
                                            className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all text-sm group-hover:bg-zinc-100"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-medium border border-red-100"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-zinc-200"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center space-y-6 py-4">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                                    <Mail className="w-8 h-8 text-green-600" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-zinc-900">Check your inbox</h3>
                                    <p className="text-zinc-500 text-sm">We've sent a password reset link to <br /> <span className="font-bold text-zinc-800">{formData.email}</span></p>
                                </div>
                                <button
                                    onClick={() => { setIsForgotPassword(false); setResetEmailSent(false); setError(""); }}
                                    className="w-full py-4 bg-white border border-zinc-200 text-zinc-600 rounded-2xl font-bold text-sm hover:bg-zinc-50 transition-all"
                                >
                                    Back to Login
                                </button>
                            </div>
                        )}

                        {!resetEmailSent && (
                            <button
                                onClick={() => { setIsForgotPassword(false); setError(""); }}
                                className="w-full py-4 bg-white border border-zinc-200 text-zinc-600 rounded-2xl font-bold text-sm hover:bg-zinc-50 transition-all"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (mode === "signup") {
            try {
                const res = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Signup failed");

                // Auto login after signup
                const result = await signIn("credentials", {
                    username: formData.username,
                    password: formData.password,
                    redirect: false,
                });
                if (result?.error) throw new Error(result.error);
                router.push("/");
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        } else {
            try {
                const result = await signIn("credentials", {
                    username: formData.username,
                    password: formData.password,
                    redirect: false,
                });

                if (result?.error) throw new Error("Invalid username or password");
                router.push("/");
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8"
            >
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <Heart className="w-7 h-7 text-white" fill="currentColor" />
                        </div>
                        <span className="text-2xl font-black text-zinc-900 tracking-tight">CareScan AI</span>
                    </div>
                    <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">
                        {mode === "login" ? "Welcome back" : "Create account"}
                    </h2>
                    <p className="text-zinc-500">
                        {mode === "login"
                            ? "Sign in to access your medical history"
                            : "Start personalizing your health journey"}
                    </p>
                </div>

                <div className="bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-sm space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1 group">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter your username"
                                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all text-sm group-hover:bg-zinc-100"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        {mode === "signup" && (
                            <div className="space-y-1 group">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all text-sm group-hover:bg-zinc-100"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1 group">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all text-sm group-hover:bg-zinc-100"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        {mode === "login" && (
                            <div className="flex justify-end -mt-3 mb-2 pr-1">
                                <button
                                    type="button"
                                    onClick={() => setIsForgotPassword(true)}
                                    className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        {mode === "signup" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1 group">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Age</label>
                                    <input
                                        type="number"
                                        placeholder="25"
                                        className="w-full px-4 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all text-sm group-hover:bg-zinc-100"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1 group">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Phone</label>
                                    <input
                                        type="text"
                                        placeholder="+1 234..."
                                        className="w-full px-4 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all text-sm group-hover:bg-zinc-100"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-medium border border-red-100"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-zinc-200"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    {mode === "login" ? "Sign In" : "Create Account"}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-zinc-500 font-medium">
                        {mode === "login" ? "New to CareScan?" : "Already have an account?"}{" "}
                        <Link
                            href={mode === "login" ? "/signup" : "/login"}
                            className="text-blue-600 hover:text-blue-700 font-bold underline underline-offset-4"
                        >
                            {mode === "login" ? "Sign up" : "Log in"}
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
