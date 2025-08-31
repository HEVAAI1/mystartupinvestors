export default function Home() {
  return (
    <main className="bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-gray-800 shadow">
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
      </nav>

      {/* Hero Section */}
      <section
  className="relative h-[70vh] flex items-center justify-center text-center bg-cover bg-center"
  style={{ backgroundImage: "url('/hero-bg.jpg')" }}
>
  <div className="absolute inset-0 bg-black/60"></div>
  <div className="absolute inset-0 backdrop-grayscale"></div> {/* <-- Grayscale filter */}
  
  <div className="relative z-10 max-w-2xl">
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
  </div>
</section>


      {/* Features Section */}
      <section id="features" className="py-20 px-6 md:px-16 text-center">
        <h2 className="text-3xl font-bold mb-12">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6 bg-gray-800 rounded-xl shadow">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Advanced Search</h3>
            <p className="text-gray-400">
              Quickly find investors based on criteria like industry, location, and more.
            </p>
          </div>
          <div className="p-6 bg-gray-800 rounded-xl shadow">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Investor Contacts</h3>
            <p className="text-gray-400">
              Skip the hassle and the queue, and directly connect with Investors easily!
            </p>
          </div>
          <div className="p-6 bg-gray-800 rounded-xl shadow">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-xl font-semibold mb-2">Investor Profiles</h3>
            <p className="text-gray-400">
              Access detailed profiles of investors including history, preferences, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 md:px-16 text-center bg-gray-800">
        <h2 className="text-3xl font-bold mb-12">Pricing Plans</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Basic Plan */}
          <div className="p-8 bg-gray-900 rounded-xl shadow flex flex-col">
            <h3 className="text-xl font-semibold mb-2">Basic</h3>
            <p className="text-4xl font-bold mb-4">$15<span className="text-lg">/month</span></p>
            <ul className="text-gray-400 mb-6 space-y-2">
              <li>✔ Access to Investor List</li>
              <li>✔ 60 Credits</li>
            </ul>
            <a
              href="/login"
              className="mt-auto px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              Choose Plan
            </a>
          </div>

          {/* Pro Plan */}
          <div className="p-8 bg-gray-900 rounded-xl shadow border-2 border-blue-600 flex flex-col">
            <h3 className="text-xl font-semibold mb-2">Pro <span className="text-sm bg-blue-600 text-white px-2 py-1 rounded">Most Popular</span></h3>
            <p className="text-4xl font-bold mb-4">$49<span className="text-lg">/month</span></p>
            <ul className="text-gray-400 mb-6 space-y-2">
              <li>✔ Access to Investor List</li>
              <li>✔ 300 Credits</li>
              <li>✔ Email support</li>
            </ul>
            <a
              href="/login"
              className="mt-auto px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              Choose Plan
            </a>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 px-6 md:px-16 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Ready to Transform Your Investment Strategy?
        </h2>
        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
          Join thousands of professionals who rely on our data to make smarter investment decisions.
        </p>
        <a
          href="/login"
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Get Started For Free
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-6 px-6 md:px-16 text-gray-400 text-sm flex justify-between">
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
