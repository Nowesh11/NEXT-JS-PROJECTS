// API endpoint for home page content
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Return home page content
    const homeContent = {
      hero: {
        title: {
          en: 'Welcome to Tamil Language Society',
          ta: 'தமிழ் மொழி சங்கத்திற்கு வரவேற்கிறோம்'
        },
        subtitle: {
          en: 'Preserving and promoting Tamil language and culture worldwide',
          ta: 'உலகம் முழுவதும் தமிழ் மொழி மற்றும் கலாச்சாரத்தை பாதுகாத்து மேம்படுத்துதல்'
        },
        description: {
          en: 'Join us in our mission to celebrate Tamil heritage through literature, education, and community engagement.',
          ta: 'இலக்கியம், கல்வி மற்றும் சமூக ஈடுபாட்டின் மூலம் தமிழ் பாரம்பரியத்தை கொண்டாட எங்கள் பணியில் சேருங்கள்.'
        },
        ctaText: {
          en: 'Explore Our Work',
          ta: 'எங்கள் பணியை ஆராயுங்கள்'
        },
        ctaLink: '/about',
        backgroundImage: '/images/hero-bg.jpg'
      },
      features: {
        title: {
          en: 'Our Mission',
          ta: 'எங்கள் நோக்கம்'
        },
        items: [
          {
            icon: 'book',
            title: {
              en: 'Literature & Publishing',
              ta: 'இலக்கியம் & வெளியீடு'
            },
            description: {
              en: 'Publishing quality Tamil literature and educational materials',
              ta: 'தரமான தமிழ் இலக்கியம் மற்றும் கல்வி பொருட்களை வெளியிடுதல்'
            }
          },
          {
            icon: 'users',
            title: {
              en: 'Community Building',
              ta: 'சமூக கட்டமைப்பு'
            },
            description: {
              en: 'Connecting Tamil speakers and enthusiasts worldwide',
              ta: 'உலகம் முழுவதும் தமிழ் பேசுபவர்கள் மற்றும் ஆர்வலர்களை இணைத்தல்'
            }
          },
          {
            icon: 'graduation-cap',
            title: {
              en: 'Education & Learning',
              ta: 'கல்வி & கற்றல்'
            },
            description: {
              en: 'Providing resources for Tamil language learning and cultural education',
              ta: 'தமிழ் மொழி கற்றல் மற்றும் கலாச்சார கல்விக்கான வளங்களை வழங்குதல்'
            }
          }
        ]
      },
      stats: {
        title: {
          en: 'Our Impact',
          ta: 'எங்கள் தாக்கம்'
        },
        items: [
          {
            number: '500+',
            label: {
              en: 'Books Published',
              ta: 'வெளியிடப்பட்ட புத்தகங்கள்'
            }
          },
          {
            number: '10K+',
            label: {
              en: 'Community Members',
              ta: 'சமூக உறுப்பினர்கள்'
            }
          },
          {
            number: '25+',
            label: {
              en: 'Years of Service',
              ta: 'சேவை ஆண்டுகள்'
            }
          },
          {
            number: '50+',
            label: {
              en: 'Countries Reached',
              ta: 'அடைந்த நாடுகள்'
            }
          }
        ]
      }
    };

    res.status(200).json({
      success: true,
      data: homeContent
    });
  } catch (error) {
    console.error('Error fetching home content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch home content'
    });
  }
}
