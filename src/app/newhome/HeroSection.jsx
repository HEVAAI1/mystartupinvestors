'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Users, DollarSign } from 'lucide-react';

const StatCard = ({ icon: Icon, value, label, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="flex items-center gap-3 bg-white/60 backdrop-blur-sm border border-black/[0.06] rounded-2xl px-5 py-3.5 shadow-sm"
    >
        <div className="w-10 h-10 rounded-xl bg-[#C6FF55]/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#1E1E1E]" />
        </div>
        <div>
            <p className="text-xl font-space font-bold text-[#1E1E1E]">{value}</p>
            <p className="text-xs font-inter text-[#6B6B6B]">{label}</p>
        </div>
    </motion.div>
);

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background orbs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-[10%] w-[500px] h-[500px] rounded-full bg-[#C6FF55]/20 blur-[120px] animate-pulse-glow" />
                <div className="absolute bottom-20 right-[10%] w-[400px] h-[400px] rounded-full bg-[#C6FF55]/10 blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#e8e4d9]/50 blur-[80px]" />
            </div>

            {/* Grain overlay */}
            <div className="absolute inset-0 grain-overlay pointer-events-none" />

            {/* Grid pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#1E1E1E 1px, transparent 1px), linear-gradient(to right, #1E1E1E 1px, transparent 1px)`,
                    backgroundSize: '80px 80px'
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
                {/* Trust badge */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-black/[0.08] rounded-full px-5 py-2 mb-8 shadow-sm"
                >
                    <Sparkles className="w-4 h-4 text-[#1E1E1E]" />
                    <span className="text-sm font-inter font-medium text-[#31372B]">Trusted by 500+ startups</span>
                    <div className="flex -space-x-1.5">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-[#1E1E1E] to-[#555] border-2 border-white" />
                        ))}
                    </div>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-[clamp(36px,6vw,72px)] font-space font-bold text-[#000] leading-[1.05] tracking-[-0.03em] max-w-4xl mx-auto"
                >
                    Access{' '}
                    <span className="relative inline-block">
                        4000+
                        <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 12" fill="none">
                            <path d="M2 8C50 2 150 2 198 8" stroke="#C6FF55" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </span>{' '}
                    Investors to Get Your Startup Funded
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl font-inter text-[#6B6B6B] max-w-2xl mx-auto mt-6 leading-relaxed"
                >
                    Connect with investors across all sectors & geographies. Stop pitching blind — start pitching smart.
                </motion.p>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button className="group relative inline-flex items-center gap-2 bg-[#1E1E1E] text-white font-inter font-semibold text-base rounded-full px-8 py-4 shadow-xl shadow-black/15 hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 hover:-translate-y-0.5">
                        Start Connecting Today
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 rounded-full bg-[#C6FF55]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button className="inline-flex items-center gap-2 text-[#31372B] font-inter font-medium text-base hover:text-[#000] transition-colors px-6 py-4">
                        See How It Works
                        <span className="text-[#C6FF55]">↓</span>
                    </button>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                    className="mt-14 flex flex-wrap items-center justify-center gap-4"
                >
                    <StatCard icon={Users} value="4,000+" label="Verified Investors" delay={0.5} />
                    <StatCard icon={DollarSign} value="$2.5B+" label="Funding Raised" delay={0.6} />
                </motion.div>

                {/* Product preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-16 relative max-w-5xl mx-auto hidden md:block"
                >
                    <div className="absolute -inset-4 bg-gradient-to-b from-[#C6FF55]/10 via-transparent to-transparent rounded-[32px] blur-xl" />
                    <div className="relative bg-[#1E1E1E] rounded-[24px] shadow-2xl shadow-black/20 overflow-hidden p-1">
                        <div className="bg-[#1E1E1E] rounded-[20px] overflow-hidden">
                            {/* Browser chrome */}
                            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                                    <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <div className="bg-white/10 rounded-lg px-4 py-1 text-xs text-white/40 font-inter">
                                        myfundinglist.com/investors
                                    </div>
                                </div>
                            </div>
                            <div className="aspect-[16/8] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center">
                                <div className="text-white/20 font-inter text-sm">Investor Database Preview</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}