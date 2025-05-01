import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface University {
  name: string;
  domains: string[];
  web_pages: string[];
  country: string;
}

interface Company {
  company: string;
  domain: string;
}

const Verification: React.FC = () => {
  const { userType } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [localPart, setLocalPart] = useState("");
  const [selectedItem, setSelectedItem] = useState<University | Company | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newCompany, setNewCompany] = useState({ company: "", domain: "" });
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  const isMentor = userType === "Mentor";

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(isMentor ? "/api/verify/companies" : "/api/verify/universities");
      const data = await res.json();
      isMentor ? setCompanies(data) : setUniversities(data);
    };
    fetchData();
  }, [isMentor]);

  const filteredItems = (isMentor ? companies : universities).filter((item) =>
    (isMentor ? (item as Company).company : (item as University).name)
      .toLowerCase()
      .startsWith(searchTerm.toLowerCase())
  );

  const handleSendVerification = async () => {
    const domain = isMentor
      ? (selectedItem as Company).domain
      : (selectedItem as University).domains[0];
    const fullEmail = `${localPart}@${domain}`;
    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch("/api/verify/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: fullEmail }),
      });

      const data = await res.json();
      if (res.ok) {
        setEmailSent(true);
        setVerificationStatus(null);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error sending verification email:", err);
    }
  };

  const handleSubmitVerificationCode = async () => {
    const domain = isMentor
      ? (selectedItem as Company).domain
      : (selectedItem as University).domains[0];
    const fullEmail = `${localPart}@${domain}`;
    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch("/api/verify/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: fullEmail, code: verificationCode }),
      });

      const data = await res.json();
      if (res.ok) {
        setVerificationStatus("success");
      } else {
        setVerificationStatus("error");
        alert(data.message);
      }
    } catch (err) {
      console.error("Verification submission error:", err);
    }
  };

  const handleSubmitCompanyRequest = async () => {
    const token = localStorage.getItem("access_token");
    await fetch("/api/verify/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newCompany),
    });
    setRequestSubmitted(true);
    setNewCompany({ company: "", domain: "" });
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-4">
        {isMentor ? "Company Verification" : "University Verification"}
      </h1>

      {selectedItem ? (
        <div className="bg-secondary-light p-4 rounded shadow-md text-white">
          <p className="mb-2 font-semibold">
            Selected {isMentor ? "Company" : "University"}:{" "}
            {isMentor
              ? (selectedItem as Company).company
              : (selectedItem as University).name}
          </p>

          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              placeholder="Enter your email username"
              value={localPart}
              onChange={(e) => setLocalPart(e.target.value)}
              className="px-3 py-2 rounded bg-gray-700 border border-gray-500 text-white w-full"
            />
            <span className="text-white">
              @
              {isMentor
                ? (selectedItem as Company).domain
                : (selectedItem as University).domains[0]}
            </span>
          </div>

          {!emailSent ? (
            <button
              onClick={handleSendVerification}
              className="bg-[#2C353D] text-[#EC6333] font-bold px-4 py-2 rounded"
            >
              Send Verification Email
            </button>
          ) : (
            <div className="mt-4">
              <input
                type="text"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="mb-2 w-full px-3 py-2 rounded bg-gray-700 border border-gray-500 text-white"
              />
              <button
                onClick={handleSubmitVerificationCode}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Submit Code
              </button>
              {verificationStatus === "success" && (
                <p className="text-green-400 mt-2">Verification successful!</p>
              )}
              {verificationStatus === "error" && (
                <p className="text-red-400 mt-2">Invalid code. Try again.</p>
              )}
              {verificationStatus === null && (
                <p className="text-yellow-400 mt-2">Check your inbox for the verification code.</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <input
            type="text"
            placeholder={`Search for your ${isMentor ? "company" : "university"}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded bg-gray-700 border border-gray-500 text-white"
          />

          <div className="bg-secondary-light rounded-md overflow-y-auto max-h-80 shadow-inner">
            {filteredItems.map((item) => (
              <div
                key={
                  isMentor
                    ? (item as Company).company
                    : (item as University).name
                }
                onClick={() => setSelectedItem(item)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-600 text-white border-b border-gray-700"
              >
                {isMentor
                  ? (item as Company).company
                  : (item as University).name}
              </div>
            ))}
            {filteredItems.length === 0 && (
              <p className="p-4 text-gray-400">No results found.</p>
            )}
          </div>
        </>
      )}

      {isMentor && (
        <div className="mt-8 border-t border-gray-600 pt-6">
          <h2 className="text-xl text-white font-bold mb-2">Request New Company</h2>
          {requestSubmitted ? (
            <p className="text-green-500">Request submitted successfully!</p>
          ) : (
            <>
              <input
                type="text"
                placeholder="Company Name"
                value={newCompany.company}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, company: e.target.value })
                }
                className="mb-2 w-full px-3 py-2 rounded bg-gray-700 border border-gray-500 text-white"
              />
              <input
                type="text"
                placeholder="Company Domain (e.g. company.com)"
                value={newCompany.domain}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, domain: e.target.value })
                }
                className="mb-4 w-full px-3 py-2 rounded bg-gray-700 border border-gray-500 text-white"
              />
              <button
                onClick={handleSubmitCompanyRequest}
                className="bg-blue-600 text-white px-4 py-2 rounded font-bold"
              >
                Submit Request
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Verification;
