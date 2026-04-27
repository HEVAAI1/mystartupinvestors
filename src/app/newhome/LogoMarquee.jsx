'use client';
import React from 'react';
import { motion } from 'framer-motion';

const logos = [
    { name: 'Khosla', letter: 'K' },
    { name: 'Antler', letter: 'A' },
    { name: 'Tiger Global', letter: 'TG' },
    { name: 'Y Combinator', letter: 'YC' },
    { name: 'Lightspeed', letter: 'L' },
    { name: 'Blume', letter: 'B' },
    { name: 'Sequoia', letter: 'S' },
    { name: 'Accel', letter: 'Ac' },
];

const LogoCard = ({ name, letter }) => (
    <div className="flex-shrink-0 flex items-center gap-3 bg-white/70 backdrop-blur-sm border border-black/[0.06] rounded-2xl px-6 py-4 shadow-sm hover:shadow-md hover:border-[#C6FF55]/30 transition-all duration-300 group">
        <div className="w-10 h-10 rounded-xl bg-[#1E1E1E] flex items-center justify-center">
            <span className="text-white font-space font-bold text-xs">{letter}</span>
        </div>
        <span className="font-inter font-medium text-[#31372B] text-sm whitespace-nowrap group-hover:text-[#000] transition-colors">{name}</span>
    </div>
);

export default function LogoMarquee() {
    return (
        <section className="py-16 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-10"
            >
                <p className="text-sm font-inter font-semibold text-[#6B6B6B] uppercase tracking-[0.15em]">
                    Connect with top investors from
                </p>
            </motion.div>

            {/* Fade edges */}
            <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <div className="relative flex overflow-hidden">
                <div className="flex animate-marquee gap-4 pr-4">
                    {[...logos, ...logos].map((logo, i) => (
                        <LogoCard key={i} {...logo} />
                    ))}
                </div>
                <div className="flex animate-marquee gap-4 pr-4" aria-hidden="true">
                    {[...logos, ...logos].map((logo, i) => (
                        <LogoCard key={`dup-${i}`} {...logo} />
                    ))}
                </div>
            </div>
        </section>
    );
}