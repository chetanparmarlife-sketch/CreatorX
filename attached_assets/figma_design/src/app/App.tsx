import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './components/LoginPage';
import { HomePage } from './components/HomePage';
import { CampaignsPage } from './components/CampaignsPage';
import { InstagramPage } from './components/InstagramPage';
import { FacebookPage } from './components/FacebookPage';
import { YouTubePage } from './components/YouTubePage';
import { PaymentsPage } from './components/PaymentsPage';
import { InfluencerListsPage } from './components/InfluencerListsPage';
import { ProfilePage } from './components/ProfilePage';
import { HelpPage } from './components/HelpPage';
import { SettingsPage } from './components/SettingsPage';
import { MessagesPage } from './components/MessagesPage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState('campaigns');

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActivePage('campaigns');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'campaigns':
        return <CampaignsPage />;
      case 'messages':
        return <MessagesPage />;
      case 'instagram':
        return <InstagramPage />;
      case 'facebook':
        return <FacebookPage />;
      case 'youtube':
        return <YouTubePage />;
      case 'payments':
        return <PaymentsPage />;
      case 'lists':
        return <InfluencerListsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'help':
        return <HelpPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F9FC]">
      <Sidebar activeId={activePage} onNavigate={setActivePage} onLogout={handleLogout} />
      {activePage === 'messages' ? (
        renderPage()
      ) : (
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1440px] mx-auto p-8">
            {renderPage()}
          </div>
        </main>
      )}
    </div>
  );
}