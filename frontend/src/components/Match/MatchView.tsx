import React, { useState, useMemo } from 'react';
import { Search, Filter, User, Briefcase, Brain, Star, Calendar, MessageSquare, GraduationCap } from 'lucide-react'; // Added GraduationCap

// --- TypeScript Interfaces ---
interface Profile {
  id: string;
  name: string;
  role: 'Mentor' | 'Mentee'; // Role in the mentorship relationship
  userType: 'Student' | 'Working Professional'; // User category
  avatarUrl: string;
  title: string; // e.g., Software Engineer, Computer Science Student
  institution?: string; // University for students, Company for professionals
  skills: string[];
  interests: string[];
  bio: string;
  availability?: string; // e.g., "Weekly", "Bi-weekly" (More relevant for mentors)
}

// --- Mock Data (Updated with userType and institution) ---
const mockProfiles: Profile[] = [
  { id: '1', name: 'Alice Wonderland', role: 'Mentor', userType: 'Working Professional', avatarUrl: 'https://placehold.co/100x100/a2d2ff/ffffff?text=AW', title: 'Senior Software Engineer', institution: 'Tech Innovations Inc.', skills: ['React', 'Node.js', 'TypeScript', 'AWS'], interests: ['AI', 'Hiking', 'Photography'], bio: 'Passionate about building scalable web applications and mentoring junior developers.', availability: 'Weekly' },
  { id: '2', name: 'Bob The Builder', role: 'Mentee', userType: 'Student', avatarUrl: 'https://placehold.co/100x100/ffb3a2/ffffff?text=BB', title: 'Computer Science Student', institution: 'State University', skills: ['HTML', 'CSS', 'JavaScript', 'Python (Learning)'], interests: ['Web Design', 'Gaming', 'Cooking'], bio: 'Eager to learn React and improve my frontend skills. Looking for guidance on career growth.' },
  { id: '3', name: 'Charlie Chaplin', role: 'Mentor', userType: 'Working Professional', avatarUrl: 'https://placehold.co/100x100/a2ffb3/ffffff?text=CC', title: 'Product Manager', institution: 'Creative Solutions Ltd.', skills: ['Product Strategy', 'Agile', 'User Research', 'Roadmapping'], interests: ['Startups', 'Travel', 'Board Games'], bio: 'Experienced PM helping aspiring product folks navigate the field.', availability: 'Bi-weekly' },
  { id: '4', name: 'Diana Prince', role: 'Mentee', userType: 'Student', avatarUrl: 'https://placehold.co/100x100/f0a2ff/ffffff?text=DP', title: 'UX Design Student', institution: 'Design Institute', skills: ['Figma', 'User Flows', 'Wireframing'], interests: ['Accessibility', 'Mobile Design', 'Reading'], bio: 'Seeking mentorship in UX research methodologies and portfolio building.' },
  { id: '5', name: 'Ethan Hunt', role: 'Mentor', userType: 'Working Professional', avatarUrl: 'https://placehold.co/100x100/fff0a2/ffffff?text=EH', title: 'Data Scientist', institution: 'Data Insights Co.', skills: ['Python', 'Machine Learning', 'SQL', 'Statistics'], interests: ['Big Data', 'Cycling', 'Music'], bio: 'Helping mentees break into data science and understand complex algorithms.', availability: 'Monthly' },
  { id: '6', name: 'Fiona Shrek', role: 'Mentee', userType: 'Student', avatarUrl: 'https://placehold.co/100x100/a2fff0/ffffff?text=FS', title: 'Software Engineering Student', institution: 'Tech University', skills: ['Java', 'Spring Boot (Learning)'], interests: ['Databases', 'Cloud Computing', 'Yoga'], bio: 'Looking for a mentor to guide my learning in backend development and system design.' },
];

// --- UI Components (using Tailwind for styling, simulating shadcn/ui structure) ---

// Reusable Card Component (Simulating shadcn/ui Card)
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-secondary border border-gray-500 rounded-lg shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-4 border-b border-gray-500 ${className}`}>{children}</div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-4 border-t border-gray-500 ${className}`}>{children}</div>
);

// Reusable Button Component (Simulating shadcn/ui Button)
const Button: React.FC<{ children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'ghost'; size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ children, onClick, variant = 'primary', size = 'md', className = '' }) => {
  const baseStyle = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900';
  const sizeStyle = size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'lg' ? 'px-5 py-2.5 text-lg' : 'px-4 py-2 text-base';
  const variantStyle =
    variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600' :
    variant === 'secondary' ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600' :
    'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-400 text-gray-700 dark:text-gray-200';

  return (
    <button onClick={onClick} className={`${baseStyle} ${sizeStyle} ${variantStyle} ${className}`}>
      {children}
    </button>
  );
};

// Reusable Input Component (Simulating shadcn/ui Input)
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }> = ({ icon, className = '', ...props }) => (
    <div className="relative flex items-center">
        {icon && <span className="absolute left-3 text-gray-400 dark:text-gray-500">{icon}</span>}
        <input
            className={`w-full rounded-md border border-gray-500 bg-secondary-light px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white ${icon ? 'pl-10' : ''} ${className}`}
            {...props}
        />
    </div>
);

// Reusable Select Component (Simulating shadcn/ui Select)
const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { icon?: React.ReactNode }> = ({ icon, children, className = '', ...props }) => (
    <div className="relative flex items-center">
        {icon && <span className="absolute left-3 text-gray-400 dark:text-gray-500">{icon}</span>}
        <select
            className={`w-full appearance-none rounded-md border border-gray-500 bg-secondary-light dark:bg-gray-700 px-3 py-2 text-sm placeholder-white text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${icon ? 'pl-10' : ''} ${className}`}
            {...props}
        >
            {children}
        </select>
        <svg className="absolute right-3 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
    </div>
);

// Reusable Badge Component
const Badge: React.FC<{ children: React.ReactNode; color?: string; className?: string }> = ({ children, color = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} ${className}`}>
    {children}
  </span>
);


// --- Profile Card Component (Updated to show userType) ---
interface ProfileCardProps {
  profile: Profile;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  // Determine icon based on userType
  const UserTypeIcon = profile.userType === 'Student' ? GraduationCap : Briefcase;

  return (
    <Card className="flex flex-col h-full transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg">
      <CardHeader className="flex items-start space-x-4">
        <img
          src={profile.avatarUrl}
          alt={`${profile.name}'s avatar`}
          className="w-16 h-16 rounded-full border-2 border-gray-600"
          // Basic fallback in case image fails to load
          onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100/cccccc/ffffff?text=User')}
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{profile.name}</h3>
          {/* Display Role (Mentor/Mentee) and User Type (Student/Professional) */}
          <div className="flex items-center space-x-2 text-sm mb-1">
             <span className="text-orange-400 font-medium">{profile.role}</span>
             <span className="text-gray-500 dark:text-gray-400">|</span>
             <span className="flex items-center text-gray-400">
                <UserTypeIcon size={14} className="mr-1" />
                {profile.userType}
             </span>
          </div>
          {/* Display Title and Institution */}
          <p className="text-sm text-gray-400">
            {profile.title}
            {profile.institution ? ` @ ${profile.institution}` : ''}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div>
          <h4 className="text-xs font-semibold uppercase text-gray-400 mb-1">Bio</h4>
          <p className="text-sm text-gray-400">{profile.bio}</p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase text-gray-400 mb-1.5">Skills</h4>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map(skill => (
              <Badge key={skill} color="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{skill}</Badge>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase text-gray-400 mb-1.5">Interests</h4>
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.map(interest => (
              <Badge key={interest} color="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">{interest}</Badge>
            ))}
          </div>
        </div>
        {profile.role === 'Mentor' && profile.availability && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 pt-2">
            <Calendar size={16} className="mr-1.5" /> Availability: {profile.availability}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="secondary" size="sm">View Profile</Button>
        <Button size="sm">
            <MessageSquare size={16} className="mr-1.5" />
            {profile.role === 'Mentor' ? 'Request Mentorship' : 'Offer Mentorship'}
        </Button>
      </CardFooter>
    </Card>
  );
};

// --- Filter Component (Updated with userType filter) ---
interface FiltersProps {
  // Updated filter state type
  onFilterChange: (filters: { searchTerm: string; role: string; skill: string; userType: string }) => void;
  skillsList: string[]; // List of all available skills for the dropdown
}

const Filters: React.FC<FiltersProps> = ({ onFilterChange, skillsList }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedUserType, setSelectedUserType] = useState(''); // State for user type filter

  // Updated handler to manage all filter states
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, filterName: keyof ReturnType<typeof useState>[0]) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setter(value);
      // Trigger filter update immediately on change
      onFilterChange({
        searchTerm: filterName === 'searchTerm' ? value : searchTerm,
        role: filterName === 'role' ? value : selectedRole,
        skill: filterName === 'skill' ? value : selectedSkill,
        userType: filterName === 'userType' ? value : selectedUserType, // Include userType
      });
    };

  return (
    <Card className="mb-6 sticky top-4 z-10">
       {/* Updated grid layout for 4 filters */}
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <Input
          name="searchTerm"
          icon={<Search size={16} />}
          placeholder="Search name, title, skill..."
          value={searchTerm}
          onChange={handleInputChange(setSearchTerm, 'searchTerm')}
        />

        {/* Role Select (Mentor/Mentee) */}
        <Select
          name="role"
          icon={<User size={16} />}
          value={selectedRole}
          onChange={handleInputChange(setSelectedRole, 'role')}
        >
          <option value="">All Roles</option>
          <option value="Mentor">Mentors</option>
          <option value="Mentee">Mentees</option>
        </Select>

        {/* User Type Select (Student/Professional) */}
        <Select
          name="userType"
          // Using Briefcase as a generic icon for this category filter
          icon={<Briefcase size={16} />}
          value={selectedUserType}
          onChange={handleInputChange(setSelectedUserType, 'userType')}
        >
          <option value="">All User Types</option>
          <option value="Student">Students</option>
          <option value="Working Professional">Working Professionals</option>
        </Select>

        {/* Skill Select */}
        <Select
          name="skill"
          icon={<Brain size={16} />}
          value={selectedSkill}
          onChange={handleInputChange(setSelectedSkill, 'skill')}
        >
          <option value="">All Skills</option>
          {skillsList.map(skill => (
            <option key={skill} value={skill}>{skill}</option>
          ))}
        </Select>
      </CardContent>
    </Card>
  );
};


// --- Main Matcher Component (Simulating a Next.js Page) ---
const MentorMenteeMatcher: React.FC = () => {
  const [profiles] = useState<Profile[]>(mockProfiles); // In real app, fetch data here
  // Updated initial filter state
  const [filters, setFilters] = useState({ searchTerm: '', role: '', skill: '', userType: '' });

  // Get unique skills for the filter dropdown
  const uniqueSkills = useMemo(() => {
    const allSkills = profiles.flatMap(p => p.skills);
    return Array.from(new Set(allSkills)).sort();
  }, [profiles]);

  // Filter profiles based on current filter state (updated logic)
  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      const searchTermLower = filters.searchTerm.toLowerCase();
      const matchesSearch = !filters.searchTerm ||
        profile.name.toLowerCase().includes(searchTermLower) ||
        profile.title.toLowerCase().includes(searchTermLower) ||
        (profile.institution && profile.institution.toLowerCase().includes(searchTermLower)) || // Search institution
        profile.skills.some(s => s.toLowerCase().includes(searchTermLower)) ||
        profile.interests.some(i => i.toLowerCase().includes(searchTermLower));

      const matchesRole = !filters.role || profile.role === filters.role;

      const matchesSkill = !filters.skill || profile.skills.includes(filters.skill);

      // Add userType filter condition
      const matchesUserType = !filters.userType || profile.userType === filters.userType;

      return matchesSearch && matchesRole && matchesSkill && matchesUserType; // Include userType match
    });
  }, [profiles, filters]);

  return (
    <div className="min-h-screen bg-secondary-light p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Find Your Match</h1>
        <p className="text-white mb-6">Connect with mentors and mentees to grow together.</p>

        {/* Filters Section - Pass updated handler and skills */}
        <Filters onFilterChange={setFilters} skillsList={uniqueSkills} />

        {/* Profiles Grid */}
        {filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map(profile => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
            <div className="text-center py-10 px-4 bg-secondary dark:bg-gray-800 rounded-lg shadow-sm">
                <Filter size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-400">No Matches Found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Export the main component as default (typical for Next.js pages)
export default MentorMenteeMatcher;
