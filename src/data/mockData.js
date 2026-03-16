export const MOCK_PRODUCTS = [
  { id: '1', name: 'Wireless Noise-Cancelling Headphones', category: 'Electronics', price: 299.99, originalPrice: 399.99, rating: 4.8, reviews: 1243, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', status: 'active', clicks: 8432, conversions: 312, stock: 45 },
  { id: '2', name: 'Premium Leather Sneakers', category: 'Fashion', price: 189.00, originalPrice: 189.00, rating: 4.6, reviews: 876, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', status: 'active', clicks: 6201, conversions: 198, stock: 23 },
  { id: '3', name: 'Smart Fitness Tracker Pro', category: 'Electronics', price: 149.99, originalPrice: 199.99, rating: 4.7, reviews: 2108, image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&q=80', status: 'active', clicks: 11234, conversions: 541, stock: 67 },
  { id: '4', name: 'Organic Skincare Bundle', category: 'Beauty', price: 89.99, originalPrice: 120.00, rating: 4.9, reviews: 543, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80', status: 'active', clicks: 4321, conversions: 289, stock: 12 },
  { id: '5', name: 'Ergonomic Gaming Chair', category: 'Home', price: 449.00, originalPrice: 599.00, rating: 4.5, reviews: 321, image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80', status: 'active', clicks: 3876, conversions: 124, stock: 8 },
  { id: '6', name: 'Stainless Steel Water Bottle', category: 'Lifestyle', price: 35.99, originalPrice: 35.99, rating: 4.7, reviews: 4521, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80', status: 'active', clicks: 9123, conversions: 654, stock: 200 },
  { id: '7', name: 'Portable Bluetooth Speaker', category: 'Electronics', price: 79.99, originalPrice: 99.99, rating: 4.4, reviews: 1876, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80', status: 'draft', clicks: 2341, conversions: 87, stock: 34 },
  { id: '8', name: 'Yoga Mat Premium', category: 'Sports', price: 68.00, originalPrice: 68.00, rating: 4.8, reviews: 762, image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400&q=80', status: 'active', clicks: 5678, conversions: 341, stock: 56 },
]

export const ANALYTICS_DATA = {
  revenue: [
    { month: 'Jan', value: 12400, prev: 9800 },
    { month: 'Feb', value: 18200, prev: 12400 },
    { month: 'Mar', value: 15800, prev: 18200 },
    { month: 'Apr', value: 22100, prev: 15800 },
    { month: 'May', value: 19600, prev: 22100 },
    { month: 'Jun', value: 28400, prev: 19600 },
    { month: 'Jul', value: 31200, prev: 28400 },
  ],
  clicks: [
    { day: 'Mon', value: 1240 },
    { day: 'Tue', value: 1820 },
    { day: 'Wed', value: 1580 },
    { day: 'Thu', value: 2210 },
    { day: 'Fri', value: 1960 },
    { day: 'Sat', value: 2840 },
    { day: 'Sun', value: 3120 },
  ],
  categoryPerformance: [
    { name: 'Electronics', value: 35, color: '#8b5cf6' },
    { name: 'Fashion', value: 22, color: '#22d3ee' },
    { name: 'Beauty', value: 18, color: '#ec4899' },
    { name: 'Home', value: 14, color: '#f59e0b' },
    { name: 'Sports', value: 11, color: '#10b981' },
  ],
  conversionFunnel: [
    { stage: 'Impressions', value: 100000, color: '#8b5cf6' },
    { stage: 'Clicks', value: 45000, color: '#7c3aed' },
    { stage: 'Add to Cart', value: 12000, color: '#6d28d9' },
    { stage: 'Purchases', value: 3400, color: '#5b21b6' },
  ],
}

export const PLANS = [
  {
    name: 'Starter',
    price: 29,
    period: 'month',
    description: 'Perfect for small Shopify stores just getting started with AI recommendations.',
    features: [
      'Up to 500 products',
      '10,000 recommendations/month',
      'Basic analytics',
      '1 embed widget',
      'Email support',
      'Standard AI model',
    ],
    highlighted: false,
    cta: 'Start Free Trial',
  },
  {
    name: 'Growth',
    price: 79,
    period: 'month',
    description: 'Ideal for growing stores that need more power and flexibility.',
    features: [
      'Up to 5,000 products',
      '100,000 recommendations/month',
      'Advanced analytics',
      'Unlimited embed widgets',
      'Priority support',
      'Enterprise AI model',
      'A/B testing',
      'Custom branding',
    ],
    highlighted: true,
    cta: 'Start Free Trial',
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 249,
    period: 'month',
    description: 'For large-scale stores requiring maximum performance and customization.',
    features: [
      'Unlimited products',
      'Unlimited recommendations',
      'Real-time analytics',
      'Unlimited embed widgets',
      'Dedicated support',
      'Custom AI training',
      'A/B testing + multivariate',
      'White-label solution',
      'API access',
      'SLA guarantee',
    ],
    highlighted: false,
    cta: 'Contact Sales',
  },
]

export const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Founder & CEO',
    company: 'LuxStyle Boutique',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=100&q=80',
    text: 'RecoAI transformed our store. Our average order value increased by 43% within the first month. The 3D product showcase keeps customers engaged for longer.',
    stats: '+43% AOV',
  },
  {
    name: 'Marcus Johnson',
    role: 'Head of E-commerce',
    company: 'TechHub Store',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    text: 'Setting up the embed widget took literally 5 minutes. The AI recommendations are incredibly accurate — our conversion rate jumped from 2.1% to 5.8%.',
    stats: '+176% CVR',
  },
  {
    name: 'Priya Patel',
    role: 'Marketing Director',
    company: 'Wellness World',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    text: 'The analytics dashboard gives us insights we never had before. We can see exactly which recommendations are driving revenue and optimize accordingly.',
    stats: '$180K added revenue',
  },
]

export const FEATURES = [
  {
    icon: 'Brain',
    title: 'AI-Powered Intelligence',
    description: 'Our advanced ML models analyze hundreds of behavioral signals to deliver hyper-personalized recommendations for each shopper.',
    color: 'violet',
  },
  {
    icon: 'Zap',
    title: 'One-Click Shopify Integration',
    description: 'Copy-paste embed code ready in seconds. No developer needed — just paste into your Shopify theme and you\'re live.',
    color: 'cyan',
  },
  {
    icon: 'BarChart3',
    title: 'Real-Time Analytics',
    description: 'Track clicks, conversions, and revenue impact in real time. Know exactly which recommendations are driving sales.',
    color: 'pink',
  },
  {
    icon: 'Palette',
    title: 'Fully Customizable Widgets',
    description: 'Match your brand perfectly with custom colors, fonts, layouts, and 3D product carousels that delight your customers.',
    color: 'amber',
  },
  {
    icon: 'Shield',
    title: 'Privacy-First Design',
    description: 'GDPR and CCPA compliant. All data is anonymized and never sold. Your customers\' trust is our top priority.',
    color: 'green',
  },
  {
    icon: 'Globe',
    title: 'Global CDN Delivery',
    description: 'Lightning-fast widget delivery from 200+ edge locations worldwide. Sub-100ms load times guaranteed anywhere.',
    color: 'blue',
  },
]
