import React, { useState, useMemo } from "react";
import { Filter } from "lucide-react";

const PreferencesTab: React.FC = () => {
  const allSkills = useMemo<string[]>(
    () => [
      "JavaScript", "Python", "Excel", "Technical Writing", "SQL",
      "Java", "C++", "Data Analysis", "Machine Learning", "Cloud Computing",
      "Cybersecurity", "Networking", "DevOps", "Git", "Docker",
      "Kubernetes", "UI/UX Design", "Project Management", "Agile Methodologies", "API Development",
      "Database Management", "Mobile Development", "Web Development", "Backend Development", "Frontend Development",
      "Debugging", "Algorithms", "Data Structures", "Testing & QA", "Version Control",
      "Communication", "Leadership", "Time Management", "Teamwork", "Critical Thinking",
      "Problem Solving", "Adaptability", "Creativity", "Emotional Intelligence", "Conflict Resolution",
      "Attention to Detail", "Decision Making", "Coaching", "Mentoring", "Strategic Thinking",
      "Work Ethic", "Empathy", "Active Listening", "Presentation Skills", "Organization",
      "Stress Management"
    ],
    []
  );

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(s => s.filter(x => x !== skill));
    } else if (selectedSkills.length < 5) {
      setSelectedSkills(s => [...s, skill]);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-light p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
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
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition
                  ${isSelected
                    ? "block px-4 py-2 bg-[#EC6333] text-white text-center font-bold rounded-lg hover:bg-accent-hover transition duration-300"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"}
                  ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PreferencesTab;
