import { useState } from "react";
import { FiUpload, FiUser, FiChevronDown } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar({ credits = 5 }: { credits?: number }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/"); // redirect to homepage
  };

  return (
    <nav className="flex items-center justify-between bg-gray-800 px-8 py-4 shadow-md relative">
      <div className="text-2xl font-bold text-white">MyStartupInvestors</div>

      <input
        type="text"
        placeholder="Search investors..."
        className="flex-1 mx-8 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Credits Left Badge */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold text-sm">
          {credits}
        </div>
        <span className="text-white text-xs">credits left</span>
      </div>

      {/* Profile Dropdown */}
      <div
        className="relative"
        onMouseEnter={() => setDropdownOpen(true)}
        onMouseLeave={() => setDropdownOpen(false)}
      >
        <button className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg hover:bg-gray-600">
          <FiUser size={20} className="text-gray-200" />
          <FiChevronDown size={16} className="text-gray-200" />
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-gray-700 text-white rounded shadow-lg z-50">
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
      <div className="flex items-center gap-4 ml-4">
        <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600">
          <FiUpload size={20} className="text-gray-200" />
        </button>
      </div>
    </nav>
  );
}
