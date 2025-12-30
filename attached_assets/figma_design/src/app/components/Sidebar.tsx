import { Home, Instagram, Facebook, Youtube, Calendar, List, CreditCard, Settings, User, LogOut, ChevronUp, MessageSquare } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  id: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

interface SidebarProps {
  activeId: string;
  onNavigate: (id: string) => void;
  onLogout: () => void;
}

export function Sidebar({ activeId, onNavigate, onLogout }: SidebarProps) {
  const navSections: NavSection[] = [
    {
      items: [
        { label: 'Home', icon: Home, id: 'home' },
      ],
    },
    {
      title: 'INFLUENCER DISCOVERY',
      items: [
        { label: 'Instagram', icon: Instagram, id: 'instagram' },
        { label: 'Facebook', icon: Facebook, id: 'facebook' },
        { label: 'YouTube', icon: Youtube, id: 'youtube' },
      ],
    },
    {
      title: 'CAMPAIGN MANAGEMENT',
      items: [
        { label: 'Campaigns', icon: Calendar, id: 'campaigns' },
        { label: 'Messages', icon: MessageSquare, id: 'messages' },
        { label: 'Influencer Lists', icon: List, id: 'lists' },
        { label: 'Payments', icon: CreditCard, id: 'payments' },
      ],
    },
    {
      items: [
        { label: 'Settings', icon: Settings, id: 'settings' },
      ],
    },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Brand */}
      <div className="px-6 py-6">
        <h2 className="text-gray-900">CreatorX</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        {navSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-6">
            {section.title && (
              <div className="px-3 mb-2">
                <span className="text-xs text-gray-500">{section.title}</span>
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white">
                <span>CF</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm text-gray-900">Carbamide Forte</div>
                <div className="text-xs text-gray-500 truncate">carbamide@opportune.co.in</div>
              </div>
              <ChevronUp className="w-4 h-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-64">
            <DropdownMenuItem onClick={() => onNavigate('profile')}>
              <User className="w-4 h-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate('help')}>
              <Settings className="w-4 h-4" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="w-4 h-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}