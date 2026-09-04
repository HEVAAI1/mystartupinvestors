import { headers } from "next/headers";
import HomePageClient from "./HomePageClient";

const FAQS = [
  { q: "How do credits work?", a: "Each credit lets you unlock one verified investor contact. Use credits anytime to reveal verified emails and direct contact info." },
  { q: "What types of investors are in your database?", a: "Our database includes angels, VCs, syndicates, funds, and strategic investors across industries and stages." },
  { q: "How often is the investor data updated?", a: "Our investor database is updated weekly with verified information to ensure accuracy." },
  { q: "Do credits expire?", a: "No. Credits never expire — you can use them anytime." },
  { q: "Can I get a refund if I don't use my credits?", a: "Unused credits are non-refundable, but they remain valid forever." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

// Server component so the JSON-LD <script> can carry the per-request CSP nonce
// (HomePageClient is "use client" and can't read next/headers).
export default async function Home() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomePageClient />
    </>
  );
}
