import { useState, useEffect, useRef } from "react";
import { FiUpload, FiUser, FiChevronDown } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar({ credits = 5 }: { credits?: number }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/"); // redirect to homepage
  };

  const handleProfile = () => {
    router.push("/profile"); // adjust to your profile page route
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="flex items-center justify-between bg-gray-800 px-8 py-4 shadow-md relative">
      {/* Logo */}
      <div className="text-2xl font-bold text-white">MyStartupInvestors</div>

      {/* Right Side (credits, profile, upload) */}
      <div className="flex items-center gap-6">
        {/* Credits + Button */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold text-sm">
            {credits}
          </div>
          <span className="text-white text-xs">credits left</span>
          <button
            onClick={() => router.push("/pricing")}
            className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-500"
          >
            Get More Credits
          </button>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <FiUser size={20} className="text-gray-200" />
            <FiChevronDown size={16} className="text-gray-200" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-gray-700 text-white rounded shadow-lg z-50">
              <button
                onClick={handleProfile}
                className="w-full text-left px-4 py-2 hover:bg-gray-600"
              >
                My Profile
              </button>
              <button
                onClick={handleProfile}
                className="w-full text-left px-4 py-2 hover:bg-gray-600"
              >
                Contact Us
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600">
          <FiUpload size={20} className="text-gray-200" />
        </button>
      </div>
    </nav>
  );
}
