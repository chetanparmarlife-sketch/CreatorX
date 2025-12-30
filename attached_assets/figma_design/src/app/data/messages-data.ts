export interface Influencer {
  id: string;
  name: string;
  username: string;
  avatar: string;
  platform: 'instagram' | 'youtube' | 'facebook';
  followers: string;
  engagementRate: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'CLOSED' | 'PENDING';
  platform: 'instagram' | 'youtube' | 'facebook';
}

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  sender: 'brand' | 'influencer';
  attachment?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  };
}

export interface Conversation {
  id: string;
  influencer: Influencer;
  campaign: Campaign;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export const mockInfluencers: Influencer[] = [
  {
    id: 'inf1',
    name: 'Sarah Johnson',
    username: '@sarahjstyle',
    avatar: 'SJ',
    platform: 'instagram',
    followers: '245K',
    engagementRate: '4.2%',
  },
  {
    id: 'inf2',
    name: 'Michael Chen',
    username: '@techbymike',
    avatar: 'MC',
    platform: 'youtube',
    followers: '1.2M',
    engagementRate: '6.8%',
  },
  {
    id: 'inf3',
    name: 'Emma Davis',
    username: '@emmafoodie',
    avatar: 'ED',
    platform: 'instagram',
    followers: '567K',
    engagementRate: '5.1%',
  },
  {
    id: 'inf4',
    name: 'Alex Rivera',
    username: '@alexfitness',
    avatar: 'AR',
    platform: 'instagram',
    followers: '890K',
    engagementRate: '7.3%',
  },
  {
    id: 'inf5',
    name: 'Jessica Lee',
    username: '@jessbeauty',
    avatar: 'JL',
    platform: 'youtube',
    followers: '2.3M',
    engagementRate: '5.9%',
  },
];

export const mockCampaigns: Campaign[] = [
  {
    id: 'camp1',
    name: 'Summer Collection Launch',
    status: 'ACTIVE',
    platform: 'instagram',
  },
  {
    id: 'camp2',
    name: 'Tech Product Review Series',
    status: 'ACTIVE',
    platform: 'youtube',
  },
  {
    id: 'camp3',
    name: 'Food & Recipe Campaign',
    status: 'ACTIVE',
    platform: 'instagram',
  },
  {
    id: 'camp4',
    name: 'Fitness Challenge 2024',
    status: 'PENDING',
    platform: 'instagram',
  },
  {
    id: 'camp5',
    name: 'Beauty Collab Series',
    status: 'CLOSED',
    platform: 'youtube',
  },
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    influencer: mockInfluencers[0],
    campaign: mockCampaigns[0],
    lastMessage: 'Sounds great! I can start posting on Monday.',
    lastMessageTime: '2m ago',
    unreadCount: 2,
    messages: [
      {
        id: 'msg1',
        text: 'Hi Sarah! Thanks for joining our Summer Collection campaign.',
        timestamp: '10:30 AM',
        sender: 'brand',
      },
      {
        id: 'msg2',
        text: 'Hello! I\'m excited to be part of this campaign.',
        timestamp: '10:32 AM',
        sender: 'influencer',
      },
      {
        id: 'msg3',
        text: 'Great! We\'d love to discuss the content calendar with you. Can we schedule a brief call this week?',
        timestamp: '10:35 AM',
        sender: 'brand',
      },
      {
        id: 'msg4',
        text: 'Absolutely! I\'m available Tuesday or Thursday afternoon.',
        timestamp: '10:38 AM',
        sender: 'influencer',
      },
      {
        id: 'msg5',
        text: 'Perfect! Let\'s do Thursday at 2 PM. I\'ll send you a calendar invite. Meanwhile, here are the campaign guidelines.',
        timestamp: '10:40 AM',
        sender: 'brand',
        attachment: {
          type: 'file',
          url: '#',
          name: 'Campaign_Guidelines.pdf',
        },
      },
      {
        id: 'msg6',
        text: 'Received! I\'ll review it before our call.',
        timestamp: '10:42 AM',
        sender: 'influencer',
      },
      {
        id: 'msg7',
        text: 'Also, when would be the best time to start posting?',
        timestamp: '11:15 AM',
        sender: 'brand',
      },
      {
        id: 'msg8',
        text: 'Sounds great! I can start posting on Monday.',
        timestamp: '11:18 AM',
        sender: 'influencer',
      },
    ],
  },
  {
    id: 'conv2',
    influencer: mockInfluencers[1],
    campaign: mockCampaigns[1],
    lastMessage: 'I\'ve uploaded the first review video to my draft folder.',
    lastMessageTime: '1h ago',
    unreadCount: 0,
    messages: [
      {
        id: 'msg9',
        text: 'Hi Michael! Welcome to our Tech Product Review Series.',
        timestamp: '9:00 AM',
        sender: 'brand',
      },
      {
        id: 'msg10',
        text: 'Thanks! Can\'t wait to get started.',
        timestamp: '9:15 AM',
        sender: 'influencer',
      },
      {
        id: 'msg11',
        text: 'We\'re shipping the product to you today. You should receive it by Friday.',
        timestamp: '9:20 AM',
        sender: 'brand',
      },
      {
        id: 'msg12',
        text: 'Perfect timing. I\'ll have the review ready by next week.',
        timestamp: '9:25 AM',
        sender: 'influencer',
      },
      {
        id: 'msg13',
        text: 'I\'ve uploaded the first review video to my draft folder.',
        timestamp: 'Yesterday',
        sender: 'influencer',
      },
    ],
  },
  {
    id: 'conv3',
    influencer: mockInfluencers[2],
    campaign: mockCampaigns[2],
    lastMessage: 'The recipe turned out amazing! My followers loved it.',
    lastMessageTime: '3h ago',
    unreadCount: 1,
    messages: [
      {
        id: 'msg14',
        text: 'Hi Emma! We\'d love for you to create some content featuring our new kitchen line.',
        timestamp: '2 days ago',
        sender: 'brand',
      },
      {
        id: 'msg15',
        text: 'I\'d be happy to! Do you have specific recipes in mind?',
        timestamp: '2 days ago',
        sender: 'influencer',
      },
      {
        id: 'msg16',
        text: 'We\'re open to your creative ideas! Maybe 3-4 recipes that showcase the versatility of our products.',
        timestamp: '2 days ago',
        sender: 'brand',
      },
      {
        id: 'msg17',
        text: 'The recipe turned out amazing! My followers loved it.',
        timestamp: '3h ago',
        sender: 'influencer',
      },
    ],
  },
  {
    id: 'conv4',
    influencer: mockInfluencers[3],
    campaign: mockCampaigns[3],
    lastMessage: 'What\'s the timeline for the challenge?',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      {
        id: 'msg18',
        text: 'Hi Alex! We\'re launching a 30-day fitness challenge and would love your participation.',
        timestamp: 'Yesterday',
        sender: 'brand',
      },
      {
        id: 'msg19',
        text: 'This sounds exciting! Tell me more.',
        timestamp: 'Yesterday',
        sender: 'influencer',
      },
      {
        id: 'msg20',
        text: 'What\'s the timeline for the challenge?',
        timestamp: 'Yesterday',
        sender: 'influencer',
      },
    ],
  },
  {
    id: 'conv5',
    influencer: mockInfluencers[4],
    campaign: mockCampaigns[4],
    lastMessage: 'Thank you for the opportunity!',
    lastMessageTime: '2 days ago',
    unreadCount: 0,
    messages: [
      {
        id: 'msg21',
        text: 'Hi Jessica! We\'d like to discuss a beauty collaboration series with you.',
        timestamp: '3 days ago',
        sender: 'brand',
      },
      {
        id: 'msg22',
        text: 'I\'m interested! What products are we featuring?',
        timestamp: '3 days ago',
        sender: 'influencer',
      },
      {
        id: 'msg23',
        text: 'Our new skincare line. We can send you the full product range for testing.',
        timestamp: '2 days ago',
        sender: 'brand',
      },
      {
        id: 'msg24',
        text: 'Thank you for the opportunity!',
        timestamp: '2 days ago',
        sender: 'influencer',
      },
    ],
  },
];
