'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, MapPin, Briefcase } from 'lucide-react';

const stats = [
    { icon: Users, value: '5,000+', label: 'Verified Investors', sub: 'Worldwide' },
    { icon: Mail, value: '4,850', label: 'Verified Emails', sub: 'Direct contacts' },
    { icon: MapPin, value: '120+', label: 'Global Locations', sub: 'Cities covered' },
    { icon: Briefcase, value: '25+', label: 'Investment Fields', sub: 'Industries' },
];

export default function StatsGateway() {
    return (
        <section className="py-28 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#C6FF55]/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-6"
                >
                    <span className="inline-block text-xs font-inter font-semibold text-[#C6FF55] bg-[#1E1E1E] px-4 py-2 rounded-full mb-6 uppercase tracking-[0.15em]">
                        Global Investor Network
                    </span>
                    <h2 className="text-[clamp(28px,4vw,44px)] font-space font-bold text-[#000] leading-tight tracking-[-0.02em]">
                        Your Gateway to 5,000+ Investors
                    </h2>
                    <p className="text-lg font-inter text-[#6B6B6B] mt-4 max-w-xl mx-auto">
                        Access verified investor contacts across industries and global locations
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-14">
                    {stats.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative p-6 lg:p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-black/[0.06] hover:border-[#C6FF55]/40 hover:shadow-lg transition-all duration-300 text-center"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-[#C6FF55]/15 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#C6FF55]/30 transition-colors">
                                <item.icon className="w-5 h-5 text-[#1E1E1E]" />
                            </div>
                            <p className="text-3xl lg:text-4xl font-space font-bold text-[#000]">{item.value}</p>
                            <p className="text-sm font-inter font-medium text-[#31372B] mt-1">{item.label}</p>
                            <p className="text-xs font-inter text-[#6B6B6B] mt-0.5">{item.sub}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <button className="inline-flex items-center gap-2 bg-[#1E1E1E] text-white font-inter font-semibold text-sm rounded-full px-8 py-4 shadow-lg shadow-black/10 hover:shadow-xl transition-all hover:-translate-y-0.5">
                        Explore Investor Database
                    </button>
                    <p className="text-xs font-inter text-[#6B6B6B] mt-4">
                        All contacts include verified email addresses • Direct access to decision-makers
                    </p>
                </motion.div>
            </div>
        </section>
    );
}