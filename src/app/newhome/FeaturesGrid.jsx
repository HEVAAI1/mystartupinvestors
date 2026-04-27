'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ListChecks, Mail, PlusCircle } from 'lucide-react';

const InvestorListPreview = () => (
    <div className="mt-6 space-y-3">
        {[
            { initials: 'SC', name: 'Sarah Chen', email: 'sarah.chen@techventures.io', firm: 'TechVentures' },
            { initials: 'MR', name: 'Michael Rodriguez', email: 'm.rodriguez@innovate.vc', firm: 'Innovate' },
            { initials: 'PS', name: 'Priya Sharma', email: 'priya@globaltech.co', firm: 'Globaltech' },
        ].map((inv, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-black/[0.04]"
            >
                <div className="w-9 h-9 rounded-full bg-[#1E1E1E] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-space font-bold">{inv.initials}</span>
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-inter font-medium text-[#1E1E1E] truncate">{inv.name}</p>
                    <p className="text-xs font-inter text-[#6B6B6B] truncate">{inv.email}</p>
                </div>
                <span className="ml-auto text-[10px] font-inter text-[#6B6B6B] bg-black/[0.04] px-2 py-1 rounded-full flex-shrink-0">{inv.firm}</span>
            </motion.div>
        ))}
        <p className="text-xs font-inter text-[#6B6B6B] text-center pt-1">Showing 3 of 5,000+ verified investors</p>
    </div>
);

const EmailPreview = () => (
    <div className="mt-6 space-y-3">
        {[
            { initials: 'SC', name: 'Sarah Chen', email: 'sarah.chen@techventures.io' },
            { initials: 'MR', name: 'Michael Rodriguez', email: 'm.rodriguez@innovate.vc' },
        ].map((inv, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-black/[0.04]"
            >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1E1E1E] to-[#555] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-space font-bold">{inv.initials}</span>
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-inter font-medium text-[#1E1E1E] truncate">{inv.name}</p>
                    <p className="text-xs font-inter text-[#6B6B6B] truncate">{inv.email}</p>
                </div>
                <button className="ml-auto text-[10px] font-inter font-semibold text-[#1E1E1E] bg-[#C6FF55]/40 px-3 py-1.5 rounded-full flex-shrink-0 hover:bg-[#C6FF55]/60 transition-colors">
                    Email
                </button>
            </motion.div>
        ))}
    </div>
);

const cardBase = "group p-7 rounded-3xl border transition-all duration-500 cursor-pointer";
const cardLight = `${cardBase} bg-white/50 backdrop-blur-sm border-black/[0.06] hover:border-[#C6FF55]/50 hover:-translate-y-2`;
const cardDark = `${cardBase} bg-gradient-to-br from-[#1E1E1E] to-[#2d2d2d] border-white/10 hover:-translate-y-2`;

export default function FeaturesGrid() {
    return (
        <section id="features" className="py-28 relative">
            <div className="absolute inset-0 grain-overlay pointer-events-none" />
            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block text-xs font-inter font-semibold text-[#6B6B6B] uppercase tracking-[0.15em] mb-3">From Idea to Investment</span>
                    <h2 className="text-[clamp(28px,4vw,44px)] font-space font-bold text-[#000] leading-tight tracking-[-0.02em]">
                        Everything you need to fuel<br className="hidden md:block" /> your startup journey
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card 1: The List */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={cardLight}
                        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
                        whileHover={{ boxShadow: '0 20px 60px rgba(198,255,85,0.15), 0 8px 30px rgba(0,0,0,0.10)' }}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-[#C6FF55]/20 group-hover:bg-[#C6FF55]/40 flex items-center justify-center mb-5 transition-all duration-300">
                            <ListChecks className="w-6 h-6 text-[#1E1E1E] group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <h3 className="text-xl font-space font-bold text-[#1E1E1E] mb-2">The List You Need</h3>
                        <p className="text-sm font-inter text-[#6B6B6B] leading-relaxed">
                            Thousands of investors, angels, and VCs organized for founders who mean business.
                        </p>
                        <InvestorListPreview />
                    </motion.div>

                    {/* Card 2: Direct Email */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className={cardLight}
                        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
                        whileHover={{ boxShadow: '0 20px 60px rgba(198,255,85,0.15), 0 8px 30px rgba(0,0,0,0.10)' }}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-[#C6FF55]/20 group-hover:bg-[#C6FF55]/40 flex items-center justify-center mb-5 transition-all duration-300">
                            <Mail className="w-6 h-6 text-[#1E1E1E] group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <h3 className="text-xl font-space font-bold text-[#1E1E1E] mb-2">Connect Directly via Email</h3>
                        <p className="text-sm font-inter text-[#6B6B6B] leading-relaxed">
                            Connect directly with investors, introduce your startups & send your pitch deck.
                        </p>
                        <EmailPreview />
                    </motion.div>

                    {/* Card 3: Add Startup */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className={`${cardDark} md:col-span-2 lg:col-span-1`}
                        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}
                        whileHover={{ boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-[#C6FF55]/20 group-hover:bg-[#C6FF55]/30 flex items-center justify-center mb-5 transition-all duration-300">
                            <PlusCircle className="w-6 h-6 text-[#C6FF55] group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <h3 className="text-xl font-space font-bold text-white mb-2">Add Your Startup</h3>
                        <p className="text-sm font-inter text-white/60 leading-relaxed">
                            Fill out the form. If your startup is exceptional, we will also manually help you raise funds.
                        </p>
                        <div className="mt-6 space-y-4">
                            <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/[0.08]">
                                <p className="text-sm font-inter text-white/80">Submit your startup details and we'll connect you with relevant investors</p>
                            </div>
                            <button className="w-full py-3.5 rounded-2xl bg-[#C6FF55] text-[#1E1E1E] font-inter font-semibold text-sm hover:bg-[#d4ff77] transition-colors">
                                Add Your Startup →
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}