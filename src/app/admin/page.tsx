"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store admin session
                localStorage.setItem("adminAuth", "true");
                router.push("/admin/dashboard");
            } else {
                setError(data.error || "Invalid credentials");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF7EE] flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-xl border border-[#31372B1F] shadow-lg p-8">
                    <h1 className="text-[32px] font-bold text-[#31372B] mb-2 text-center">
                        Admin Panel
                    </h1>
                    <p className="text-[14px] text-[#717182] mb-8 text-center">
                        Sign in to access the admin dashboard
                    </p>

                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label className="block text-[14px] font-semibold text-[#31372B] mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border border-[#31372B1F] rounded-md outline-none focus:ring-2 focus:ring-[#31372B] text-[14px]"
                                placeholder="admin@mystartupinvestors.com"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-[14px] font-semibold text-[#31372B] mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-[#31372B1F] rounded-md outline-none focus:ring-2 focus:ring-[#31372B] text-[14px]"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-[14px] text-red-600">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#31372B] text-white py-2.5 rounded-md font-bold text-[14px] hover:opacity-90 transition disabled:opacity-50"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
