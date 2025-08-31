export default function LoginPage() {
  return (
    <div className="bg-[#111418] font-sans min-h-screen w-full flex flex-col md:flex-row">
      {/* Left Section (hidden on mobile) */}
      <div className="hidden md:flex w-1/2 bg-slate-900 text-white p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-6">
            Unlock the Power of Investor Data
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Gain access to comprehensive investor data to make informed
            decisions and stay ahead in the market. Our platform provides
            real-time insights and analytics to help you achieve your
            investment goals.
          </p>
        </div>

        <div className="mt-8 rounded-lg overflow-hidden">
          <img
            src="/chart-image.png"
            alt="Abstract data and analytics"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Right Section (always visible) */}
      <div className="w-full md:w-1/2 bg-[#111418] p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Access Your Account
          </h2>

          {/* Google Sign In Button */}
          <div className="mt-6">
            <button
              type="button"
              className="w-full flex items-center justify-center py-3 px-4 border border-slate-700 rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-900"
            >
              <svg
                className="h-5 w-5 mr-3"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-slate-400">
            By signing in, you agree to our{" "}
            <a
              href="#"
              className="font-medium text-blue-500 hover:text-blue-400"
            >
              Terms of Service
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
