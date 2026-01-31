export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: [
        '10 profile searches per month',
        'Limited messaging',
        'Basic features',
        'Community support'
      ],
      limits: {
        searchesPerMonth: 10,
        messagesPerDay: 20
      }
    },
    {
      id: 'regular',
      name: 'Regular',
      price: 299,
      features: [
        '50 profile searches per month',
        'Enhanced messaging',
        'Priority support',
        'See who viewed your profile',
        'Advanced filters'
      ],
      limits: {
        searchesPerMonth: 50,
        messagesPerDay: 100
      },
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 599,
      features: [
        'Unlimited profile searches',
        'Direct messaging',
        'SMS notifications',
        'Featured profile',
        'No ads',
        'Priority customer support',
        'Advanced AI matching',
        'Video chat priority'
      ],
      limits: {
        searchesPerMonth: -1, // unlimited
        messagesPerDay: -1 // unlimited
      },
      popular: true
    }
  ];

  res.status(200).json({ plans });
}