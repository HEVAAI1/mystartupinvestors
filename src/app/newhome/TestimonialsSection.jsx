'use client';
import React from 'react';
import { motion } from 'framer-motion';

// Original bento-grid style from the reference site
const testimonials = [
    {
        type: 'featured',
        quote: 'MyFundingList connected us with 15 VCs in our first month. The verified emails and direct contact info saved us months of cold outreach.',
        name: 'Priya Sharma',
        role: 'CEO, TechFlow',
        initials: 'PS',
    },
    {
        type: 'headline',
        headline: "We've 5x'd our investor meetings",
        sub: 'The quality of contacts is unmatched.',
        name: 'Rahul Verma',
        role: 'Founder, FinNext',
        initials: 'RV',
    },
    {
        type: 'case-study',
        headline: 'How GrowthLabs raised $2M in 90 days',
        link: 'Read the case study here →',
    },
    {
        type: 'quote',
        quote: 'Before MyFundingList, our team spent weeks researching investors. Now we focus on what matters — building our product.',
        name: 'Anjali Mehta',
        role: 'Co-founder, HealthTech Solutions',
        initials: 'AM',
    },
    {
        type: 'quote',
        quote: 'MyFundingList landed us some of our top investor partnerships!',
        name: 'Vikram Singh',
        role: 'CEO, E-commerce startup',
        initials: 'VS',
    },
    {
        type: 'headline',
        headline: 'Closed our seed round in 60 days',
        sub: 'The database is comprehensive and always up-to-date.',
        name: 'Deepak Kumar',
        role: 'Founder, AI Innovations',
        initials: 'DK',
    },
];

const Avatar = ({ initials, size = 'sm' }) => (
    <div className={`rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#555] flex items-center justify-center flex-shrink-0 ${size === 'lg' ? 'w-12 h-12' : 'w-9 h-9'}`}>
        <span className="text-white font-space font-bold text-xs">{initials}</span>
    </div>
);

export default function TestimonialsSection() {
    return (
        <section id="testimonials" className="py-28 relative overflow-hidden bg-[#FAF7EE]">
            <div className="absolute inset-0 grain-overlay pointer-events-none opacity-60" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <span className="inline-block text-xs font-inter font-semibold text-[#6B6B6B] uppercase tracking-[0.15em] mb-3">
                        Testimonials
                    </span>
                    <h2 className="text-[clamp(28px,4vw,44px)] font-space font-bold text-[#000] leading-tight tracking-[-0.02em]">
                        Trusted by Indian Founders
                    </h2>
                    <p className="text-lg font-inter text-[#6B6B6B] mt-4">
                        See how founders are accelerating their fundraising journey with MyFundingList
                    </p>
                </motion.div>

                {/* Bento grid — matching original layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                    {/* Featured large card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="lg:row-span-2 bg-[#1E1E1E] rounded-3xl p-8 flex flex-col justify-between border border-black/10 shadow-lg"
                    >
                        <div>
                            <div className="flex gap-1 mb-6">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <svg key={s} viewBox="0 0 16 16" className="w-4 h-4 fill-[#C6FF55]">
                                        <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-white/90 font-inter text-lg leading-relaxed">
                                "{testimonials[0].quote}"
                            </p>
                        </div>
                        <div className="flex items-center gap-3 mt-8">
                            <Avatar initials={testimonials[0].initials} size="lg" />
                            <div>
                                <p className="font-inter font-semibold text-white">{testimonials[0].name}</p>
                                <p className="text-sm font-inter text-white/40">{testimonials[0].role}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Headline card 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/70 backdrop-blur-sm rounded-3xl p-7 border border-black/[0.06] shadow-sm hover:shadow-lg hover:border-[#C6FF55]/30 transition-all duration-300"
                    >
                        <h3 className="text-2xl font-space font-bold text-[#1E1E1E] leading-snug mb-2">
                            {testimonials[1].headline}
                        </h3>
                        <p className="text-sm font-inter text-[#6B6B6B]">{testimonials[1].sub}</p>
                        <div className="flex items-center gap-2 mt-6">
                            <Avatar initials={testimonials[1].initials} />
                            <div>
                                <p className="text-sm font-inter font-semibold text-[#1E1E1E]">{testimonials[1].name}</p>
                                <p className="text-xs font-inter text-[#6B6B6B]">{testimonials[1].role}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Case study card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#C6FF55]/10 rounded-3xl p-7 border border-[#C6FF55]/30 shadow-sm hover:shadow-lg hover:bg-[#C6FF55]/15 transition-all duration-300"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-[#1E1E1E] flex items-center justify-center mb-4">
                            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#C6FF55" strokeWidth="2">
                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" strokeLinecap="round" strokeLinejoin="round" />
                                <polyline points="13 2 13 9 20 9" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-space font-bold text-[#1E1E1E] leading-snug mb-3">
                            {testimonials[2].headline}
                        </h3>
                        <a href="#" className="text-sm font-inter font-semibold text-[#1E1E1E] underline underline-offset-2 hover:text-[#6B6B6B] transition-colors">
                            {testimonials[2].link}
                        </a>
                    </motion.div>

                    {/* Quote card 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 }}
                        className="bg-white/70 backdrop-blur-sm rounded-3xl p-7 border border-black/[0.06] shadow-sm hover:shadow-lg hover:border-[#C6FF55]/30 transition-all duration-300"
                    >
                        <p className="text-[#31372B] font-inter leading-relaxed text-sm">
                            "{testimonials[3].quote}"
                        </p>
                        <div className="flex items-center gap-2 mt-5">
                            <Avatar initials={testimonials[3].initials} />
                            <div>
                                <p className="text-sm font-inter font-semibold text-[#1E1E1E]">{testimonials[3].name}</p>
                                <p className="text-xs font-inter text-[#6B6B6B]">{testimonials[3].role}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quote card 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/70 backdrop-blur-sm rounded-3xl p-7 border border-black/[0.06] shadow-sm hover:shadow-lg hover:border-[#C6FF55]/30 transition-all duration-300"
                    >
                        <p className="text-[#31372B] font-inter leading-relaxed text-sm">
                            "{testimonials[4].quote}"
                        </p>
                        <div className="flex items-center gap-2 mt-5">
                            <Avatar initials={testimonials[4].initials} />
                            <div>
                                <p className="text-sm font-inter font-semibold text-[#1E1E1E]">{testimonials[4].name}</p>
                                <p className="text-xs font-inter text-[#6B6B6B]">{testimonials[4].role}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Headline card 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.25 }}
                        className="bg-[#1E1E1E] rounded-3xl p-7 border border-black/10 shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                        <h3 className="text-2xl font-space font-bold text-white leading-snug mb-2">
                            {testimonials[5].headline}
                        </h3>
                        <p className="text-sm font-inter text-white/50">{testimonials[5].sub}</p>
                        <div className="flex items-center gap-2 mt-6">
                            <Avatar initials={testimonials[5].initials} />
                            <div>
                                <p className="text-sm font-inter font-semibold text-white">{testimonials[5].name}</p>
                                <p className="text-xs font-inter text-white/40">{testimonials[5].role}</p>
                            </div>
                        </div>
                    </motion.div>

                </div>

                {/* CTA below */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center text-sm font-inter text-[#6B6B6B] mt-10"
                >
                    Join hundreds of founders who've successfully raised funding.{' '}
                    <a href="#" className="font-semibold text-[#1E1E1E] underline underline-offset-2">Start your journey today.</a>
                </motion.p>
            </div>
        </section>
    );
}