import React, { useState, useMemo, useEffect } from "react";
import { Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PreferencesTab: React.FC = () => {
  const { userType } = useAuth();
  const [openToConnect, setOpenToConnect] = useState<boolean>(false);
  const [shareInfo, setShareInfo] = useState<boolean>(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const allSkills = useMemo<string[]>(
    () => [
      "JavaScript","Python","Excel","Technical Writing","SQL",
      "Java","C++","Data Analysis","Machine Learning","Cloud Computing",
      "Cybersecurity","Networking","DevOps","Git","Docker",
      "Kubernetes","UI/UX Design","Project Management","Agile Methodologies","API Development",
      "Database Management","Mobile Development","Web Development","Backend Development","Frontend Development",
      "Debugging","Algorithms","Data Structures","Testing & QA","Version Control",
      "Communication","Leadership","Time Management","Teamwork","Critical Thinking",
      "Problem Solving","Adaptability","Creativity","Emotional Intelligence","Conflict Resolution",
      "Attention to Detail","Decision Making","Coaching","Mentoring","Strategic Thinking",
      "Work Ethic","Empathy","Active Listening","Presentation Skills","Organization",
      "Stress Management"
    ],
    []
  );

  const toggleSkill = (skill: string) => {
    setSelectedSkills(s =>
      s.includes(skill) ? s.filter(x => x !== skill)
        : s.length < 5 ? [...s, skill]
        : s
    );
  };

  // On mount, fetch existing preferences
  useEffect(() => {
    const loadPreferences = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const res = await fetch("/api/profile/getPreferences", {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        });
        if (!res.ok) throw new Error("Failed to load preferences");
        const data = await res.json();
        setOpenToConnect(data.open_to_connect);
        setShareInfo(data.share_info);
        setSelectedSkills(data.skills || []);
      } catch (err) {
        console.error("Error loading preferences:", err);
      }
    };
    loadPreferences();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch("/api/profile/setPreferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          openToConnect,
          shareInfo,
          skills: selectedSkills,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage("Preferences saved!");
    } catch (err: any) {
      console.error("Save preferences failed:", err);
      setMessage("Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-light p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header with toggles and save */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary mb-2">
              Preferences
            </h1>
            <p className="text-text-secondary mb-4">
              Click the toggles to update your connection and privacy settings:
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setOpenToConnect(o => !o)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  openToConnect
                    ? "bg-[#EC6333] text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {userType === "Mentor"
                  ? "Open to connecting with mentees"
                  : "Open to connecting with mentors"}
              </button>
              <button
                onClick={() => setShareInfo(s => !s)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  shareInfo
                    ? "bg-[#EC6333] text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {userType === "Mentor"
                  ? "Share my info with mentees"
                  : "Share my info with mentors"}
              </button>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary text-text-primary rounded hover:bg-primary-dark transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {message && (
          <p className="text-sm text-text-secondary">{message}</p>
        )}

        {/* Skills selector */}
        <div>
          <div className="flex items-center mb-2">
            <Filter className="w-6 h-6 text-primary mr-2" />
            <h2 className="text-2xl font-semibold text-text-primary">
              Select up to 5 skills to match for:
            </h2>
          </div>
          <p className="mb-4 text-text-secondary">
            You have selected{" "}
            <span className="font-medium text-text-primary">
              {selectedSkills.length}
            </span>{" "}
            of 5.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {allSkills.map(skill => {
              const isSelected = selectedSkills.includes(skill);
              const disabled = !isSelected && selectedSkills.length >= 5;
              return (
                <button
                  key={skill}
                  onClick={() => !disabled && toggleSkill(skill)}
                  disabled={disabled}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    isSelected
                      ? "bg-[#EC6333] text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesTab;
