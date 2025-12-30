'use client'

import { HelpCircle, Mail, MessageSquare, FileText, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

const helpCategories = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of using CreatorX',
    icon: FileText,
    color: 'bg-blue-100 text-blue-700',
    links: [
      'How to create your first campaign',
      'Finding the right influencers',
      'Setting up payment methods',
    ],
  },
  {
    title: 'Campaign Management',
    description: 'Tips for running successful campaigns',
    icon: MessageSquare,
    color: 'bg-sky-100 text-sky-700',
    links: [
      'Campaign best practices',
      'Managing deliverables',
      'Tracking campaign performance',
    ],
  },
  {
    title: 'Payments & Billing',
    description: 'Payment processing and invoices',
    icon: Mail,
    color: 'bg-green-100 text-green-700',
    links: [
      'Payment methods accepted',
      'Understanding invoices',
      'Refund policy',
    ],
  },
  {
    title: 'FAQs',
    description: 'Common questions answered',
    icon: HelpCircle,
    color: 'bg-orange-100 text-orange-700',
    links: [
      'Account settings',
      'Privacy and security',
      'Technical issues',
    ],
  },
]

export default function HelpPage() {
  return (
    <div>
      <PageHeader title="Help & Support" />

      <div className="max-w-4xl space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How can we help you?</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help articles..."
              className="w-full h-12 pl-4 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {helpCategories.map((category) => {
            const Icon = category.icon
            return (
              <div key={category.title} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">{category.title}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {category.links.map((link, idx) => (
                    <button
                      key={idx}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center justify-between group"
                    >
                      {link}
                      <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-sky-50 rounded-lg border border-sky-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-white">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900 font-medium">Need more help?</h3>
              <p className="text-sm text-gray-600">Contact our support team for personalized assistance</p>
            </div>
            <button className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
