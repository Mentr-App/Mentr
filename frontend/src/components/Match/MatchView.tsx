import React, { useState } from 'react';
import ExploreTab from './ExploreTab'; // Your current MentorMenteeMatcher content
import PreferencesTab from './PreferencesTab';
import PendingInvitationsTab from './PendingInvitationsTab';
import CurrentConnectionsTab from './CurrentConnectionsTab';

const MatchViewPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('explore');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'explore':
        return <ExploreTab />;
      case 'pending':
        return <PendingInvitationsTab />;
      case 'connections':
        return <CurrentConnectionsTab />;
      case 'preferences':
        return <PreferencesTab />;
      default:
        return <ExploreTab />;
    }
  };

  return (
    <div className="min-h-screen bg-secondary-light p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Mentorship Center</h1>

        {/* Tabs Header */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'explore' ? 'text-white bg-[#EC6333]' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Explore
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'connections' ? 'text-white bg-[#EC6333]' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Current Connections
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'pending' ? 'text-white bg-[#EC6333]' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Pending Invitations
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'preferences' ? 'text-white bg-[#EC6333]' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Preferences
          </button>
        </div>

        {/* Dynamic Tab Content */}
        <div>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default MatchViewPage;
