import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

interface SearchableDropdownProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    className?: string;
}

export default function SearchableDropdown({
    options,
    value,
    onChange,
    placeholder,
    className = "",
}: SearchableDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter options based on search term
    const filteredOptions = options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Update search term when value changes externally (e.g. reset)
    useEffect(() => {
        if (value === "All") {
            setSearchTerm("");
        }
    }, [value]);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div
                className="relative cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center justify-between w-full bg-white border border-[#31372B1F] rounded-md px-3 py-2 text-sm text-[#31372B]">
                    <span className={`block truncate ${!value || value === "All" ? "text-[#717182]" : ""}`}>
                        {value === "All" ? placeholder : value}
                    </span>
                    <ChevronDown size={16} className={`text-[#717182] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-[#31372B1F] rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-[#31372B1F]">
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full pl-8 pr-2 py-1.5 text-sm border border-[#31372B1F] rounded-md focus:outline-none focus:border-[#31372B]"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                            <Search size={14} className="absolute left-2.5 top-2.5 text-[#717182]" />
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-48">
                        <div
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-[#F5F5F5] ${value === "All" ? "bg-[#F5F5F5] font-medium" : ""}`}
                            onClick={() => {
                                onChange("All");
                                setIsOpen(false);
                                setSearchTerm("");
                            }}
                        >
                            All
                        </div>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-[#F5F5F5] ${value === option ? "bg-[#F5F5F5] font-medium" : ""}`}
                                    onClick={() => {
                                        onChange(option);
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }}
                                >
                                    {option}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-[#717182] text-center">
                                No results found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
