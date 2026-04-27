'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Search, Database, Rocket } from 'lucide-react';

const steps = [
    {
        step: '01',
        icon: Search,
        label: 'The Problem',
        title: 'Finding investors takes months of wasted research and guesswork.',
        color: '#FF6B6B',
    },
    {
        step: '02',
        icon: Database,
        label: 'The Solution',
        title: 'We built a reliable, easy-to-use database of verified investors.',
        color: '#C6FF55',
    },
    {
        step: '03',
        icon: Rocket,
        label: 'The Outcome',
        title: 'You connect faster, pitch smarter, and raise sooner.',
        color: '#55B8FF',
    },
];

export default function StepsSection() {
    return (
        <section className="relative bg-[#1E1E1E] py-28 overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#C6FF55]/5 rounded-full blur-[120px]" />
            </div>
            <div className="absolute inset-0 grain-overlay pointer-events-none opacity-50" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-[clamp(32px,4vw,48px)] font-space font-bold text-white leading-tight tracking-[-0.02em]">
                        We've Fixed Fundraising Frustration
                    </h2>
                    <p className="text-lg font-inter text-white/50 mt-4">
                        Stop pitching blind. Start pitching smart.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {steps.map((item, i) => (
                        <motion.div
                            key={item.step}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15 }}
                            className="group relative"
                        >
                            <div className="relative p-8 lg:p-10 rounded-3xl bg-white/[0.05] border border-white/[0.08] backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.08] hover:border-[#C6FF55]/30 hover:-translate-y-1">
                                {/* Step number */}
                                <div className="inline-flex items-center gap-2 bg-white/[0.08] rounded-full px-4 py-1.5 mb-8">
                                    <span className="text-xs font-inter font-semibold text-white/60 tracking-wider">STEP {item.step}</span>
                                </div>

                                {/* Icon */}
                                <div className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-6 group-hover:border-[#C6FF55]/30 transition-colors">
                                    <item.icon className="w-7 h-7 text-white/60 group-hover:text-[#C6FF55] transition-colors" />
                                </div>

                                {/* Label */}
                                <p className="text-sm font-inter font-semibold text-white/50 uppercase tracking-[0.1em] mb-3 group-hover:text-[#C6FF55] transition-colors">
                                    {item.label}
                                </p>

                                {/* Title */}
                                <h3 className="text-xl font-space font-semibold text-white leading-snug group-hover:text-[#C6FF55] transition-colors">
                                    {item.title}
                                </h3>

                                {/* Glow on hover */}
                                <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-[#C6FF55]/0 to-[#C6FF55]/0 group-hover:from-[#C6FF55]/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center text-white/30 font-inter text-sm mt-14"
                >
                    Your fundraising journey, simplified from start to finish
                </motion.p>
            </div>
        </section>
    );
}