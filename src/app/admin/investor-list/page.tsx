"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { Eye, Plus, FileSpreadsheet, Search, Pencil, Trash2 } from "lucide-react";
import InvestorDetailsModal from "@/components/InvestorDetailsModal";
import AddInvestorModal from "@/components/AddInvestorModal";
import AddInvestorExcelModal from "@/components/AddInvestorExcelModal";
import EditInvestorModal from "@/components/EditInvestorModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

interface Investor {
  id: number;
  name: string;
  firm_name: string;
  email: string;
  linkedin: string;
  city: string;
  country: string;
  preference_sector: string;
  about: string;
  type?: string;
}

export default function InvestorListPage() {
  // Server-side pagination state
  const [currentPageData, setCurrentPageData] = useState<Investor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 50;

  // Modal state
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [investorToEdit, setInvestorToEdit] = useState<Investor | null>(null);
  const [investorToDelete, setInvestorToDelete] = useState<Investor | null>(null);

  // Debounce search input (300ms)
  // Manual search trigger
  const handleSearch = () => {
    setDebouncedSearch(searchTerm);
    setCurrentPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Fetch investors with server-side pagination and search
  useEffect(() => {
    fetchInvestors();
  }, [currentPage, debouncedSearch]);

  const fetchInvestors = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("investors")
        .select("*", { count: "exact" });

      // Server-side search across multiple fields
      if (debouncedSearch) {
        query = query.or(
          `name.ilike.%${debouncedSearch}%,` +
          `firm_name.ilike.%${debouncedSearch}%,` +
          `email.ilike.%${debouncedSearch}%,` +
          `country.ilike.%${debouncedSearch}%,` +
          `preference_sector.ilike.%${debouncedSearch}%,` +
          `type.ilike.%${debouncedSearch}%`
        );
      }

      const { data, count, error } = await query
        .range(from, to)
        .order("id", { ascending: true });

      if (error) throw error;

      setCurrentPageData(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching investors:", error);
      setCurrentPageData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (investor: Investor) => {
    setSelectedInvestor(investor);
    setShowModal(true);
  };

  const handleEdit = (investor: Investor) => {
    setInvestorToEdit(investor);
    setShowEditModal(true);
  };

  const handleDelete = (investor: Investor) => {
    setInvestorToDelete(investor);
    setShowDeleteModal(true);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, totalCount);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-[#717182]">Loading investors...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[32px] font-bold text-[#31372B] mb-2">
            Investor Table
          </h1>
          <p className="text-[16px] text-[#717182]">
            {totalCount} investor{totalCount !== 1 ? 's' : ''} in database
            {debouncedSearch && (
              <span className="ml-2 text-[14px]">
                (showing {currentPageData.length} results)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-[#31372B1F] rounded-lg hover:bg-[#F5F5F5] transition text-[14px] font-medium"
          >
            <Plus size={18} />
            Add Investor
          </button>
          <button
            onClick={() => setShowExcelModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#31372B] text-white rounded-lg hover:opacity-90 transition text-[14px] font-medium"
          >
            <FileSpreadsheet size={18} />
            Add via Excel
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name, firm, email, country, sector, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-2 border border-[#31372B1F] rounded-lg outline-none focus:ring-2 focus:ring-[#31372B] text-[14px]"
          />
        </div>
        <button
          onClick={handleSearch}
          className="bg-[#31372B] text-white p-2 rounded-lg hover:opacity-90 transition flex items-center justify-center shrink-0"
          aria-label="Search"
        >
          <Search size={20} />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#31372B1F] shadow-sm overflow-hidden">
        <div className="bg-white rounded-xl border border-[#31372B1F] shadow-sm overflow-hidden">
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-[#F5F5F5] border-b border-[#31372B1F]">
                <tr>
                  <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                    Firm
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                    Sectors
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#31372B1F]">
                {currentPageData.map((investor: Investor) => (
                  <tr key={investor.id} className="hover:bg-[#F5F5F5] transition">
                    <td className="px-6 py-4 text-[14px] text-[#717182]">
                      {investor.id}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#31372B] font-medium">
                      {investor.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#717182]">
                      {investor.firm_name || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {investor.type ? (
                        <span className="bg-[#F5F5F5] border border-[#31372B1F] text-[#31372B] text-xs px-2 py-0.5 rounded-md whitespace-nowrap">
                          {investor.type}
                        </span>
                      ) : (
                        <span className="text-[14px] text-[#717182]">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#717182]">
                      {investor.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#717182]">
                      {investor.city && investor.country
                        ? `${investor.city}, ${investor.country}`
                        : investor.country || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {investor.preference_sector?.split(",").slice(0, 2).map((sector: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-[12px] font-medium"
                          >
                            {sector.trim()}
                          </span>
                        ))}
                        {investor.preference_sector?.split(",").length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-[12px] font-medium">
                            +{investor.preference_sector.split(",").length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(investor)}
                          className="p-2 bg-[#31372B] text-white rounded-md hover:opacity-90 transition group relative"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(investor)}
                          className="p-2 border border-[#31372B1F] text-[#31372B] rounded-md hover:bg-[#F5F5F5] transition group relative"
                          title="Edit Investor"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(investor)}
                          className="p-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition group relative"
                          title="Delete Investor"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View - Cards */}
          <div className="md:hidden flex flex-col divide-y divide-[#31372B1F]">
            {currentPageData.map((investor: Investor) => (
              <div key={investor.id} className="p-4 hover:bg-[#F5F5F5] transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-[#31372B] font-semibold text-[16px]">{investor.name || "N/A"}</h3>
                    <p className="text-[#717182] text-[14px]">{investor.firm_name || "No Firm"}</p>
                  </div>
                  {investor.type && (
                    <span className="bg-[#F5F5F5] border border-[#31372B1F] text-[#31372B] text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                      {investor.type}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <p className="text-[12px] text-[#717182]">Email</p>
                    <p className="text-[14px] text-[#31372B] truncate">{investor.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#717182]">Location</p>
                    <p className="text-[14px] text-[#31372B]">
                      {investor.city && investor.country
                        ? `${investor.city}, ${investor.country}`
                        : investor.country || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-[12px] text-[#717182] mb-1">Sectors</p>
                  <div className="flex flex-wrap gap-1">
                    {investor.preference_sector?.split(",").slice(0, 3).map((sector: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[10px] font-medium"
                      >
                        {sector.trim()}
                      </span>
                    ))}
                    {investor.preference_sector?.split(",").length > 3 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-700 border border-gray-100 rounded-md text-[10px] font-medium">
                        +{investor.preference_sector.split(",").length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-[#31372B0F]">
                  <button
                    onClick={() => handleViewDetails(investor)}
                    className="flex-1 flex items-center justify-center gap-2 p-2 bg-[#31372B] text-white rounded-md text-[14px]"
                  >
                    <Eye size={16} /> View
                  </button>
                  <button
                    onClick={() => handleEdit(investor)}
                    className="flex items-center justify-center p-2 border border-[#31372B1F] text-[#31372B] rounded-md"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(investor)}
                    className="flex items-center justify-center p-2 border border-red-200 text-red-600 rounded-md"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {currentPageData.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-[#717182]">No investors found</p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalCount > PAGE_SIZE && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-[#31372B1F] bg-[#F5F5F5]">
            <div className="text-sm text-[#717182]">
              Showing {startIndex} to {endIndex} of {totalCount} investors
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1.5 rounded border border-[#31372B1F] text-sm disabled:opacity-50 hover:bg-white transition disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm text-[#717182]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || loading}
                className="px-3 py-1.5 rounded border border-[#31372B1F] text-sm disabled:opacity-50 hover:bg-white transition disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <InvestorDetailsModal
        investor={selectedInvestor}
        open={showModal}
        onClose={() => setShowModal(false)}
      />

      <AddInvestorModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchInvestors}
      />

      <AddInvestorExcelModal
        open={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        onSuccess={fetchInvestors}
      />

      <EditInvestorModal
        investor={investorToEdit}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={fetchInvestors}
      />

      <DeleteConfirmModal
        investor={investorToDelete}
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={fetchInvestors}
      />
    </div>
  );
}
