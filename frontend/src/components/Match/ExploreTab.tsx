import React, { useState, useEffect } from "react";
import { Filter, Search, User, Briefcase } from "lucide-react";
import MentorCard, { Mentor } from "./MentorCard";
import { useAuth } from "@/contexts/AuthContext";

// Extend the Mentor interface to include userType
interface ExtendedMentor extends Mentor {
  userType: "Mentor" | "Mentee";
}

const Filters: React.FC<{
  onFilterChange: (filters: {
    searchTerm: string;
    industry: string;
    company: string;
  }) => void;
}> = ({ onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [industry, setIndustry] = useState("");
  const [company, setCompany] = useState("");

  const handleChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    key: string
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setter(value);
    onFilterChange({
      searchTerm: key === "searchTerm" ? value : searchTerm,
      industry: key === "industry" ? value : industry,
      company: key === "company" ? value : company,
    });
  };

  return (
    <div className="bg-secondary border border-gray-600 rounded-lg p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        <input
          className="pl-10 w-full rounded-md border border-gray-500 bg-secondary-light text-white py-2 px-3 text-sm placeholder-gray-400"
          placeholder="Search by name, company, or industry"
          value={searchTerm}
          onChange={handleChange(setSearchTerm, "searchTerm")}
        />
      </div>
      <div className="relative">
        <Briefcase className="absolute left-3 top-2.5 text-gray-400" size={16} />
        <input
          className="pl-10 w-full rounded-md border border-gray-500 bg-secondary-light text-white py-2 px-3 text-sm placeholder-gray-400"
          placeholder="Filter by industry"
          value={industry}
          onChange={handleChange(setIndustry, "industry")}
        />
      </div>
      <div className="relative">
        <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
        <input
          className="pl-10 w-full rounded-md border border-gray-500 bg-secondary-light text-white py-2 px-3 text-sm placeholder-gray-400"
          placeholder="Filter by company"
          value={company}
          onChange={handleChange(setCompany, "company")}
        />
      </div>
    </div>
  );
};

const ExploreTab: React.FC = () => {
  const { isAuthenticated, userType } = useAuth();
  const [users, setUsers] = useState<ExtendedMentor[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ExtendedMentor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch("/api/match/matchable");

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Failed to fetch matchable users. Server said:", errorText);
          throw new Error("Failed to fetch matchable users.");
        }

        const data = await res.json();
        console.log("Fetched users:", data);

        const oppositeType = userType === "Mentor" ? "Mentee" : "Mentor";
        const filteredByRole = data.filter(
          (user: ExtendedMentor) => user.userType === oppositeType
        );

        setUsers(filteredByRole);
        setFilteredUsers(filteredByRole);
      } catch (err) {
        console.error("Error in fetchMatches:", err);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && userType) {
      fetchMatches();
    }
  }, [isAuthenticated, userType]);

  const handleFilterChange = (filters: {
    searchTerm: string;
    industry: string;
    company: string;
  }) => {
    const term = filters.searchTerm.toLowerCase();
    setFilteredUsers(
      users.filter((user) => {
        return (
          (!filters.searchTerm ||
            user.username.toLowerCase().includes(term) ||
            user.company.toLowerCase().includes(term) ||
            user.industry.toLowerCase().includes(term)) &&
          (!filters.industry ||
            user.industry.toLowerCase().includes(filters.industry.toLowerCase())) &&
          (!filters.company ||
            user.company.toLowerCase().includes(filters.company.toLowerCase()))
        );
      })
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 p-6 h-[88vh] overflow-scroll text-white">
        <h1 className="text-3xl font-bold mb-4">Explore</h1>
        <p className="text-gray-300">Please log in to view matchable users.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 h-[88vh] overflow-scroll" style={{ backgroundColor: "var(--background)" }}>
      <h1 className="text-3xl font-bold text-white mb-6">
        Explore {userType === "Mentor" ? "Mentees" : "Mentors"}
      </h1>

      <Filters onFilterChange={handleFilterChange} />

      {loading ? (
        <p className="text-white text-sm">Loading...</p>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-10 px-4 bg-secondary dark:bg-gray-800 rounded-lg shadow-sm">
          <Filter size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-400">No Matches Found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <MentorCard
              key={user._id.$oid}
              mentor={user}
              onClick={() => console.log("Clicked:", user.username)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreTab;
