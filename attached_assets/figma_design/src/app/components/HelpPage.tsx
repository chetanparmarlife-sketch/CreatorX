import { MessageCircle, Mail, FileText, CircleHelp } from 'lucide-react';
import { PageHeader } from './PageHeader';

interface HelpCard {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  link: string;
  color: string;
}

const helpCards: HelpCard[] = [
  {
    icon: MessageCircle,
    title: 'Live Chat Support',
    description: 'Chat with our support team in real-time',
    link: 'Start Chat',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Send us an email and we\'ll respond within 24 hours',
    link: 'support@creatorx.com',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    icon: FileText,
    title: 'Documentation',
    description: 'Browse our comprehensive guides and tutorials',
    link: 'View Docs',
    color: 'bg-green-100 text-green-700',
  },
  {
    icon: CircleHelp,
    title: 'FAQs',
    description: 'Find answers to commonly asked questions',
    link: 'View FAQs',
    color: 'bg-orange-100 text-orange-700',
  },
];

export function HelpPage() {
  return (
    <div>
      <PageHeader title="Help & Support" />

      <div className="mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <h2 className="text-gray-900 mb-2">How can we help you?</h2>
          <p className="text-gray-600 mb-6">
            Choose from the options below or search our knowledge base
          </p>
          <div className="max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search for help articles..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {helpCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-gray-900 mb-2">{card.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{card.description}</p>
              <a href="#" className="text-sm text-sky-600 hover:text-sky-700">
                {card.link} →
              </a>
            </div>
          );
        })}
      </div>

      {/* Contact Form */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
        <h3 className="text-gray-900 mb-4">Send us a message</h3>
        <form className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              placeholder="How can we help?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Message</label>
            <textarea
              rows={5}
              placeholder="Describe your issue or question..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}