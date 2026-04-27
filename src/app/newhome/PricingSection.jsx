'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';

const plans = [
    {
        name: 'Starter',
        price: 'Free',
        subtitle: 'Get started with basics',
        description: 'Perfect for exploring our investor database',
        features: ['Access to 100 investors', 'Basic search filters', 'View investor profiles', 'Limited to 5 searches/day', 'Email support'],
        cta: 'Get Started',
        popular: false,
        dark: false,
    },
    {
        name: 'Professional',
        price: '$15',
        subtitle: '60 credits',
        description: 'Unlock verified investor contacts',
        features: ['Everything in Starter', '60 investor contact unlocks', 'Verified email addresses', 'Advanced search filters', 'Export to CSV', 'Priority email support'],
        cta: 'Get Started',
        popular: true,
        dark: false,
    },
    {
        name: 'Growth',
        price: '$49',
        subtitle: '300 credits',
        description: 'Scale your fundraising outreach',
        features: ['Everything in Professional', '300 investor contact unlocks', 'Unlimited searches', 'Save investor lists', 'Track outreach activity', 'Dedicated account manager'],
        cta: 'Get Started',
        popular: false,
        dark: false,
    },
    {
        name: 'Enterprise',
        price: '$999',
        subtitle: 'Unlimited credits',
        description: 'For serious fundraisers',
        features: ['Everything in Growth', 'Unlimited contact unlocks', 'Multi-user accounts', 'Custom integrations', 'White-label options', 'Dedicated support team'],
        cta: 'Get Started',
        popular: false,
        dark: true,
    },
];

export default function PricingSection() {
    return (
        <section id="pricing" className="py-28 relative">
            <div className="absolute inset-0 grain-overlay pointer-events-none" />
            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-[clamp(28px,4vw,44px)] font-space font-bold text-[#000] leading-tight tracking-[-0.02em]">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-lg font-inter text-[#6B6B6B] mt-4">
                        Choose the plan that fits your fundraising needs
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative group rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 ${plan.dark
                                    ? 'bg-[#1E1E1E] text-white border border-white/10'
                                    : plan.popular
                                        ? 'bg-white border-2 border-[#C6FF55] shadow-xl shadow-[#C6FF55]/10'
                                        : 'bg-white/60 backdrop-blur-sm border border-black/[0.06] hover:border-[#C6FF55]/30 hover:shadow-lg'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C6FF55] text-[#1E1E1E] text-xs font-inter font-bold px-4 py-1 rounded-full flex items-center gap-1">
                                    <Zap className="w-3 h-3" /> MOST POPULAR
                                </div>
                            )}

                            <p className={`text-sm font-inter font-semibold ${plan.dark ? 'text-white/60' : 'text-[#6B6B6B]'}`}>
                                {plan.name}
                            </p>
                            <div className="mt-3 mb-1">
                                <span className={`text-4xl font-space font-bold ${plan.dark ? 'text-white' : 'text-[#000]'}`}>
                                    {plan.price}
                                </span>
                            </div>
                            <p className={`text-xs font-inter ${plan.dark ? 'text-white/40' : 'text-[#6B6B6B]'}`}>
                                {plan.subtitle}
                            </p>
                            <p className={`text-sm font-inter mt-4 ${plan.dark ? 'text-white/60' : 'text-[#6B6B6B]'}`}>
                                {plan.description}
                            </p>

                            <div className="my-6 h-px bg-black/[0.06]" />

                            <ul className="space-y-3">
                                {plan.features.map((feature, j) => (
                                    <li key={j} className="flex items-start gap-2.5">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.dark ? 'bg-[#C6FF55]/20' : 'bg-[#C6FF55]/20'
                                            }`}>
                                            <Check className={`w-3 h-3 ${plan.dark ? 'text-[#C6FF55]' : 'text-[#1E1E1E]'}`} />
                                        </div>
                                        <span className={`text-sm font-inter ${plan.dark ? 'text-white/70' : 'text-[#31372B]'}`}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full mt-8 py-3.5 rounded-2xl font-inter font-semibold text-sm transition-all duration-300 ${plan.popular
                                    ? 'bg-[#1E1E1E] text-white hover:bg-[#333] shadow-lg shadow-black/10'
                                    : plan.dark
                                        ? 'bg-[#C6FF55] text-[#1E1E1E] hover:bg-[#d4ff77]'
                                        : 'bg-[#1E1E1E]/5 text-[#1E1E1E] hover:bg-[#1E1E1E] hover:text-white'
                                }`}>
                                {plan.cta}
                            </button>
                        </motion.div>
                    ))}
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center text-sm font-inter text-[#6B6B6B] mt-10"
                >
                    All plans include access to our verified investor database. Credits never expire.
                </motion.p>
            </div>
        </section>
    );
}