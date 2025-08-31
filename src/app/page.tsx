"use client";

import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="bg-gray-900 text-white font-sans">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-center px-8 py-4 bg-gray-800 shadow"
      >
        <div className="text-xl font-bold">Investor Insights</div>
        <ul className="hidden md:flex gap-6 text-gray-300">
          <li><a href="#features" className="hover:text-white">Features</a></li>
          <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
          <li><a href="#contact" className="hover:text-white">Contact</a></li>
        </ul>
        <a
          href="/login"
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          Get Started
        </a>
      </motion.nav>

      {/* Hero Section */}
      <section
        className="relative h-[70vh] flex items-center justify-center text-center bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="absolute inset-0 backdrop-grayscale"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-2xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Unlock the Power of <span className="text-blue-500">Investor Data</span>
          </h1>
          <p className="text-lg text-gray-300 mb-6">
            Gain a competitive edge with our comprehensive investor data platform.
          </p>
          <a
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Get Started Now
          </a>
        </motion.div>
      </section>

      {/* What We Do */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="py-20 px-6 md:px-16 text-center bg-gray-900"
      >
        <h2 className="text-3xl font-bold mb-4">What We Do</h2>
        <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
          We provide comprehensive data and analytics to empower your investment decisions.
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { icon: "📘", title: "Investor Database", text: "Access a vast database of investors, from angel investors to venture capital firms." },
            { icon: "📈", title: "Market Analysis", text: "Stay ahead of the curve with in-depth market analysis and trend reports." },
            { icon: "✅", title: "Verified Data", text: "Rely on our verified and up-to-date data for your critical investment decisions." }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="p-6 bg-gray-800 rounded-xl shadow"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-400">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features */}
      <motion.section
        id="features"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 px-6 md:px-16 text-center"
      >
        <h2 className="text-3xl font-bold mb-12">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { icon: "🔍", title: "Advanced Search", text: "Quickly find investors based on criteria like industry, location, and more." },
            { icon: "📊", title: "Investor Contacts", text: "Skip the hassle and directly connect with investors easily!" },
            { icon: "👤", title: "Investor Profiles", text: "Access detailed profiles of investors including history, preferences, and more." }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="p-6 bg-gray-800 rounded-xl shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Pricing */}
      <motion.section
        id="pricing"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 px-6 md:px-16 text-center bg-gray-800"
      >
        <h2 className="text-3xl font-bold mb-12">Pricing Plans</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {[
            {
              name: "Basic",
              price: "$15",
              features: ["✔ Access to Investor List", "✔ 60 Credits"],
              highlight: false,
            },
            {
              name: "Pro",
              price: "$49",
              features: ["✔ Access to Investor List", "✔ 300 Credits", "✔ Email support"],
              highlight: true,
            },
          ].map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              viewport={{ once: true }}
              className={`p-8 bg-gray-900 rounded-xl shadow flex flex-col ${plan.highlight ? "border-2 border-blue-600" : ""}`}
            >
              <h3 className="text-xl font-semibold mb-2">
                {plan.name}
                {plan.highlight && (
                  <span className="text-sm bg-blue-600 text-white px-2 py-1 rounded ml-2">
                    Most Popular
                  </span>
                )}
              </h3>
              <p className="text-4xl font-bold mb-4">{plan.price}<span className="text-lg">/month</span></p>
              <ul className="text-gray-400 mb-6 space-y-2">
                {plan.features.map((f, idx) => <li key={idx}>{f}</li>)}
              </ul>
              <a
                href="/login"
                className="mt-auto px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                Choose Plan
              </a>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 px-6 md:px-16 text-center bg-gray-900"
      >
        <h2 className="text-3xl font-bold mb-4">Testimonials</h2>
        <p className="text-gray-400 mb-12">See what our users are saying about Investor Insights.</p>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { text: "Investor Insights has been a game-changer for our fundraising efforts. The data is accurate and the platform is incredibly easy to use.", name: "John Doe", role: "CEO, TechStart" },
            { text: "The quality of data and insights provided by this platform is unparalleled. It's an indispensable tool for any serious entrepreneur.", name: "Jane Smith", role: "Founder, Innovate Co." },
            { text: "I use Investor Insights daily to track market trends and identify potential investment opportunities. Highly recommended!", name: "Samuel Lee", role: "Investment Analyst" }
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="p-6 bg-gray-800 rounded-xl shadow text-left"
            >
              <p className="text-gray-300 mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <img
                  src="/PlaceholderProfilePhoto.png"
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-gray-400">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* FAQs */}

            {/* FAQ Section */}
      <motion.section
        id="faq"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="py-20 px-6 md:px-16 text-center bg-gray-800"
      >
        <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
        <p className="text-gray-400 mb-12">
          Here are some of the most common questions we get.
        </p>

        <div className="max-w-3xl mx-auto space-y-4 text-left">
          {[
            {
              q: "How accurate is the data?",
              a: "Our data is constantly updated and verified from multiple reliable sources to ensure high accuracy.",
            },
            {
              q: "Can I cancel my subscription at any time?",
              a: "Yes — you can cancel anytime from your account settings. Your access continues until the end of the paid period.",
            },
            {
              q: "Do you offer a trial period?",
              a: "Yes, we offer a 7-day free trial so you can explore the platform before committing.",
            },
          ].map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              viewport={{ once: true }}
              className="p-6 bg-gray-900 rounded-xl shadow"
            >
              <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
              <p className="text-gray-400">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>


      {/* Footer */}
      <footer className="bg-gray-900 py-6 px-6 md:px-16 text-gray-400 text-sm flex justify-between">
        <div>© 2024 Investor Insights. All rights reserved.</div>
        <div className="flex gap-4">
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Contact Us</a>
        </div>
      </footer>
    </main>
  );
}
