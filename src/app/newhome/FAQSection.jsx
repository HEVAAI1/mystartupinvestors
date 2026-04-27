'use client';
import React from 'react';
import { motion } from 'framer-motion';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        q: 'How do credits work?',
        a: "Each credit lets you unlock one verified investor contact. Use credits anytime to reveal verified emails and direct contact info.",
    },
    {
        q: 'What types of investors are in your database?',
        a: 'Our database includes angels, VCs, syndicates, funds, and strategic investors across industries and stages.',
    },
    {
        q: 'How often is the investor data updated?',
        a: 'Our investor database is updated weekly with verified information to ensure accuracy.',
    },
    {
        q: 'Do credits expire?',
        a: 'No. Credits never expire — you can use them anytime.',
    },
    {
        q: "Can I get a refund if I don't use my credits?",
        a: 'Unused credits are non-refundable, but they remain valid forever.',
    },
];

export default function FAQSection() {
    return (
        <section className="py-28 relative">
            <div className="absolute inset-0 grain-overlay pointer-events-none" />
            <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <h2 className="text-[clamp(28px,4vw,44px)] font-space font-bold text-[#000] leading-tight tracking-[-0.02em]">
                        FAQs
                    </h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <Accordion type="single" collapsible className="space-y-3">
                        {faqs.map((faq, i) => (
                            <AccordionItem
                                key={i}
                                value={`faq-${i}`}
                                className="bg-white/60 backdrop-blur-sm border border-black/[0.06] rounded-2xl px-6 data-[state=open]:border-[#C6FF55]/30 data-[state=open]:shadow-lg data-[state=open]:shadow-[#C6FF55]/5 transition-all"
                            >
                                <AccordionTrigger className="text-left font-inter font-semibold text-[#1E1E1E] text-base py-5 hover:no-underline">
                                    {faq.q}
                                </AccordionTrigger>
                                <AccordionContent className="font-inter text-[#6B6B6B] text-sm leading-relaxed pb-5">
                                    {faq.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>
            </div>
        </section>
    );
}