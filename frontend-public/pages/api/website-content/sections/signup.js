// API endpoint for signup page content
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Return signup page content
    const signupContent = {
      meta: {
        title: {
          en: 'Sign Up',
          ta: 'பதிவு செய்யுங்கள்'
        },
        description: {
          en: 'Join the Tamil Literary Society and explore the rich world of Tamil literature.',
          ta: 'தமிழ் இலக்கிய சங்கத்தில் சேர்ந்து தமிழ் இலக்கியத்தின் வளமான உலகத்தை ஆராயுங்கள்.'
        }
      },
      header: {
        welcome: {
          en: 'Join Tamil Literary Society',
          ta: 'தமிழ் இலக்கிய சங்கத்தில் சேருங்கள்'
        },
        subtitle: {
          en: 'Create your account to explore Tamil literature and connect with fellow enthusiasts',
          ta: 'தமிழ் இலக்கியத்தை ஆராய்ந்து சக ஆர்வலர்களுடன் இணைக்க உங்கள் கணக்கை உருவாக்கவும்'
        }
      },
      form: {
        step1: {
          title: {
            en: 'Personal Information',
            ta: 'தனிப்பட்ட தகவல்'
          },
          fields: {
            firstName: {
              label: {
                en: 'First Name',
                ta: 'முதல் பெயர்'
              },
              placeholder: {
                en: 'Enter your first name',
                ta: 'உங்கள் முதல் பெயரை உள்ளிடவும்'
              }
            },
            lastName: {
              label: {
                en: 'Last Name',
                ta: 'கடைசி பெயர்'
              },
              placeholder: {
                en: 'Enter your last name',
                ta: 'உங்கள் கடைசி பெயரை உள்ளிடவும்'
              }
            },
            email: {
              label: {
                en: 'Email Address',
                ta: 'மின்னஞ்சல் முகவரி'
              },
              placeholder: {
                en: 'Enter your email',
                ta: 'உங்கள் மின்னஞ்சலை உள்ளிடவும்'
              }
            },
            phone: {
              label: {
                en: 'Phone Number',
                ta: 'தொலைபேசி எண்'
              },
              placeholder: {
                en: 'Enter your phone number',
                ta: 'உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்'
              }
            },
            password: {
              label: {
                en: 'Password',
                ta: 'கடவுச்சொல்'
              },
              placeholder: {
                en: 'Enter your password',
                ta: 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்'
              }
            },
            confirmPassword: {
              label: {
                en: 'Confirm Password',
                ta: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்'
              },
              placeholder: {
                en: 'Confirm your password',
                ta: 'உங்கள் கடவுச்சொல்லை உறுதிப்படுத்தவும்'
              }
            }
          }
        },
        step2: {
          title: {
            en: 'Profile Information',
            ta: 'சுயவிவர தகவல்'
          },
          fields: {
            birthDate: {
              label: {
                en: 'Date of Birth',
                ta: 'பிறந்த தேதி'
              }
            },
            gender: {
              label: {
                en: 'Gender',
                ta: 'பாலினம்'
              },
              options: {
                male: {
                  en: 'Male',
                  ta: 'ஆண்'
                },
                female: {
                  en: 'Female',
                  ta: 'பெண்'
                },
                other: {
                  en: 'Other',
                  ta: 'மற்றவை'
                },
                preferNotToSay: {
                  en: 'Prefer not to say',
                  ta: 'சொல்ல விரும்பவில்லை'
                }
              }
            },
            location: {
              label: {
                en: 'Location',
                ta: 'இடம்'
              },
              placeholder: {
                en: 'Enter your location',
                ta: 'உங்கள் இடத்தை உள்ளிடவும்'
              }
            },
            bio: {
              label: {
                en: 'Bio',
                ta: 'சுயவிவரம்'
              },
              placeholder: {
                en: 'Tell us about yourself',
                ta: 'உங்களைப் பற்றி சொல்லுங்கள்'
              }
            },
            interests: {
              label: {
                en: 'Interests',
                ta: 'ஆர்வங்கள்'
              },
              options: [
                {
                  en: 'Classical Literature',
                  ta: 'பாரம்பரிய இலக்கியம்'
                },
                {
                  en: 'Modern Poetry',
                  ta: 'நவீன கவிதை'
                },
                {
                  en: 'Historical Texts',
                  ta: 'வரலாற்று நூல்கள்'
                },
                {
                  en: 'Religious Texts',
                  ta: 'மத நூல்கள்'
                },
                {
                  en: 'Folk Tales',
                  ta: 'நாட்டுப்புற கதைகள்'
                },
                {
                  en: 'Drama & Theatre',
                  ta: 'நாடகம் & நாட்டியம்'
                },
                {
                  en: 'Language Learning',
                  ta: 'மொழி கற்றல்'
                },
                {
                  en: 'Translation',
                  ta: 'மொழிபெயர்ப்பு'
                },
                {
                  en: 'Research & Academia',
                  ta: 'ஆராய்ச்சி & கல்வி'
                },
                {
                  en: 'Cultural Studies',
                  ta: 'கலாச்சார ஆய்வுகள்'
                }
              ]
            },
            languageLevels: {
              reading: {
                label: {
                  en: 'Reading Level',
                  ta: 'வாசிப்பு நிலை'
                }
              },
              writing: {
                label: {
                  en: 'Writing Level',
                  ta: 'எழுத்து நிலை'
                }
              },
              speaking: {
                label: {
                  en: 'Speaking Level',
                  ta: 'பேச்சு நிலை'
                }
              },
              options: {
                beginner: {
                  en: 'Beginner',
                  ta: 'தொடக்கநிலை'
                },
                intermediate: {
                  en: 'Intermediate',
                  ta: 'இடைநிலை'
                },
                advanced: {
                  en: 'Advanced',
                  ta: 'மேம்பட்ட நிலை'
                },
                native: {
                  en: 'Native',
                  ta: 'தாய்மொழி'
                }
              }
            }
          }
        },
        preferences: {
          terms: {
            label: {
              en: 'I agree to the Terms of Service and Privacy Policy',
              ta: 'சேவை விதிமுறைகள் மற்றும் தனியுரிமைக் கொள்கையை ஏற்றுக்கொள்கிறேன்'
            }
          },
          newsletter: {
            label: {
              en: 'I would like to receive newsletters and updates about Tamil language and culture',
              ta: 'தமிழ் மொழி மற்றும் கலாச்சாரம் பற்றிய செய்திமடல்கள் மற்றும் புதுப்பிப்புகளைப் பெற விரும்புகிறேன்'
            }
          },
          notifications: {
            label: {
              en: 'Send me notifications about new content and community updates',
              ta: 'புதிய உள்ளடக்கம் மற்றும் சமூக புதுப்பிப்புகள் பற்றிய அறிவிப்புகளை எனக்கு அனுப்பவும்'
            }
          }
        },
        buttons: {
          next: {
            en: 'Next',
            ta: 'அடுத்து'
          },
          previous: {
            en: 'Previous',
            ta: 'முந்தைய'
          },
          createAccount: {
            en: 'Create Account',
            ta: 'கணக்கை உருவாக்கவும்'
          }
        }
      },
      passwordStrength: {
        veryWeak: {
          en: 'Very Weak',
          ta: 'மிகவும் பலவீனமான'
        },
        weak: {
          en: 'Weak',
          ta: 'பலவீனமான'
        },
        fair: {
          en: 'Fair',
          ta: 'நடுத்தர'
        },
        good: {
          en: 'Good',
          ta: 'நல்ல'
        },
        strong: {
          en: 'Strong',
          ta: 'வலுவான'
        }
      },
      verification: {
        title: {
          en: 'Email Verification',
          ta: 'மின்னஞ்சல் சரிபார்ப்பு'
        },
        description: {
          en: 'We\'ve sent a verification code to your email address. Please enter the 6-digit code below.',
          ta: 'உங்கள் மின்னஞ்சல் முகவரிக்கு சரிபார்ப்பு குறியீட்டை அனுப்பியுள்ளோம். கீழே 6-இலக்க குறியீட்டை உள்ளிடவும்.'
        },
        resend: {
          en: 'Resend Code',
          ta: 'குறியீட்டை மீண்டும் அனுப்பவும்'
        },
        verify: {
          en: 'Verify Email',
          ta: 'மின்னஞ்சலை சரிபார்க்கவும்'
        }
      },
      messages: {
        success: {
          en: 'Account created successfully! Please check your email for verification.',
          ta: 'கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது! சரிபார்ப்புக்காக உங்கள் மின்னஞ்சலைச் சரிபார்க்கவும்.'
        },
        error: {
          en: 'An error occurred. Please try again.',
          ta: 'ஒரு பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.'
        },
        emailExists: {
          en: 'An account with this email already exists.',
          ta: 'இந்த மின்னஞ்சலுடன் ஏற்கனவே ஒரு கணக்கு உள்ளது.'
        },
        passwordMismatch: {
          en: 'Passwords do not match.',
          ta: 'கடவுச்சொற்கள் பொருந்தவில்லை.'
        },
        invalidEmail: {
          en: 'Please enter a valid email address.',
          ta: 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.'
        },
        requiredField: {
          en: 'This field is required.',
          ta: 'இந்த புலம் தேவை.'
        }
      },
      links: {
        login: {
          text: {
            en: 'Already have an account? Sign in here',
            ta: 'ஏற்கனவே கணக்கு உள்ளதா? இங்கே உள்நுழையவும்'
          },
          url: '/login'
        },
        terms: {
          text: {
            en: 'Terms of Service',
            ta: 'சேவை விதிமுறைகள்'
          },
          url: '/terms'
        },
        privacy: {
          text: {
            en: 'Privacy Policy',
            ta: 'தனியுரிமைக் கொள்கை'
          },
          url: '/privacy'
        }
      }
    };

    res.status(200).json(signupContent);
  } catch (error) {
    console.error('Error fetching signup content:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}