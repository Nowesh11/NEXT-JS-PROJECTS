import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal, InteractiveCard, StaggerContainer, MagneticButton } from './MicroInteractions';

const ContentRenderer = ({ page, language = 'en' }) => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (page) {
      fetchContent();
    }
  }, [page, language]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/content?page=${page}&language=${language}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      
      const data = await response.json();
      setContent(data.data || []);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedContent = (bilingualContent) => {
    if (!bilingualContent) return '';
    if (typeof bilingualContent === 'string') return bilingualContent;
    return bilingualContent[language] || bilingualContent.en || '';
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  };

  const renderHeroSection = (section) => {
    const title = getLocalizedContent(section.title);
    const content = getLocalizedContent(section.content);
    const subtitle = getLocalizedContent(section.subtitle);
    const buttonText = getLocalizedContent(section.buttonText);
    const primaryImage = section.primaryImage || section.images?.[0];

    return (
      <section className={`hero-section ${section.stylePreset || 'default'}`} key={section._id}>
        <div className="relative min-h-[500px] flex items-center justify-center">
          {primaryImage && (
            <div className="absolute inset-0 z-0">
              <Image
                src={getImageUrl(primaryImage)}
                alt={title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
          )}
          <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
            {title && (
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {title}
              </h1>
            )}
            {subtitle && (
              <h2 className="text-xl md:text-2xl mb-6 opacity-90">
                {subtitle}
              </h2>
            )}
            {content && (
              <p className="text-lg md:text-xl mb-8 opacity-80">
                {content}
              </p>
            )}
            {buttonText && section.buttonUrl && (
              <Link
                href={section.buttonUrl}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                {buttonText}
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderTextSection = (section) => {
    const title = getLocalizedContent(section.title);
    const content = getLocalizedContent(section.content);
    const subtitle = getLocalizedContent(section.subtitle);

    return (
      <section className={`text-section py-16 ${section.stylePreset || 'default'}`} key={section._id}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                {title}
              </h2>
            )}
            {subtitle && (
              <h3 className="text-xl md:text-2xl mb-8 text-gray-600">
                {subtitle}
              </h3>
            )}
            {content && (
              <div 
                className="text-lg text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderImageTextSection = (section) => {
    const title = getLocalizedContent(section.title);
    const content = getLocalizedContent(section.content);
    const subtitle = getLocalizedContent(section.subtitle);
    const primaryImage = section.primaryImage || section.images?.[0];
    const layout = section.layout || 'left';

    return (
      <section className={`image-text-section py-16 ${section.stylePreset || 'default'}`} key={section._id}>
        <div className="container mx-auto px-4">
          <div className={`flex flex-col ${layout === 'right' ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}>
            {primaryImage && (
              <div className="lg:w-1/2">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={getImageUrl(primaryImage)}
                    alt={title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
            <div className="lg:w-1/2">
              {title && (
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                  {title}
                </h2>
              )}
              {subtitle && (
                <h3 className="text-xl md:text-2xl mb-6 text-gray-600">
                  {subtitle}
                </h3>
              )}
              {content && (
                <div 
                  className="text-lg text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderCarouselSection = (section) => {
    const title = getLocalizedContent(section.title);
    const content = getLocalizedContent(section.content);
    const images = section.images || [];

    return (
      <section className={`carousel-section py-16 ${section.stylePreset || 'default'}`} key={section._id}>
        <div className="container mx-auto px-4">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900">
              {title}
            </h2>
          )}
          {content && (
            <p className="text-lg text-gray-700 mb-12 text-center max-w-3xl mx-auto">
              {content}
            </p>
          )}
          {images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={getImageUrl(image)}
                    alt={`${title} ${index + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderFeaturesSection = (section) => {
    const title = getLocalizedContent(section.title);
    const content = getLocalizedContent(section.content);
    const features = section.features || [];

    return (
      <section className={`features-section py-16 ${section.stylePreset || 'default'}`} key={section._id}>
        <div className="container mx-auto px-4">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900">
              {title}
            </h2>
          )}
          {content && (
            <p className="text-lg text-gray-700 mb-12 text-center max-w-3xl mx-auto">
              {content}
            </p>
          )}
          {features.length > 0 && (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <ScrollReveal key={index} direction="up" delay={index * 0.1}>
                  <InteractiveCard 
                    className="text-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 h-full"
                    hoverScale={1.05}
                    hoverY={-8}
                  >
                    {feature.icon && (
                      <div className="text-4xl mb-4 transform transition-transform duration-300 hover:scale-110">{feature.icon}</div>
                    )}
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">
                      {getLocalizedContent(feature.title)}
                    </h3>
                    <p className="text-gray-700">
                      {getLocalizedContent(feature.description)}
                    </p>
                  </InteractiveCard>
                </ScrollReveal>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>
    );
  };

  const renderStatsSection = (section) => {
    const title = getLocalizedContent(section.title);
    const content = getLocalizedContent(section.content);
    const stats = section.stats || [];

    return (
      <section className={`stats-section py-16 bg-blue-600 text-white ${section.stylePreset || 'default'}`} key={section._id}>
        <div className="container mx-auto px-4">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              {title}
            </h2>
          )}
          {content && (
            <p className="text-lg mb-12 text-center max-w-3xl mx-auto opacity-90">
              {content}
            </p>
          )}
          {stats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2">
                    {stat.value}
                  </div>
                  <div className="text-lg opacity-90">
                    {getLocalizedContent(stat.label)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderTestimonialSection = (section) => {
    const title = getLocalizedContent(section.title);
    const content = getLocalizedContent(section.content);
    const testimonials = section.testimonials || [];

    return (
      <section className={`testimonial-section py-16 bg-gray-50 ${section.stylePreset || 'default'}`} key={section._id}>
        <div className="container mx-auto px-4">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900">
              {title}
            </h2>
          )}
          {content && (
            <p className="text-lg text-gray-700 mb-12 text-center max-w-3xl mx-auto">
              {content}
            </p>
          )}
          {testimonials.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="text-gray-600 mb-4 italic">
                    "{getLocalizedContent(testimonial.content)}"
                  </div>
                  <div className="flex items-center">
                    {testimonial.avatar && (
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                        <Image
                          src={getImageUrl(testimonial.avatar)}
                          alt={testimonial.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonial.position}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderSection = (section) => {
    if (!section.isActive || !section.isVisible) return null;

    switch (section.sectionType) {
      case 'hero':
        return renderHeroSection(section);
      case 'text':
        return renderTextSection(section);
      case 'image-text':
        return renderImageTextSection(section);
      case 'carousel':
        return renderCarouselSection(section);
      case 'features':
        return renderFeaturesSection(section);
      case 'stats':
        return renderStatsSection(section);
      case 'testimonial':
        return renderTestimonialSection(section);
      default:
        return renderTextSection(section);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-red-600 mb-4">Error loading content: {error}</div>
        <button 
          onClick={fetchContent}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!content.length) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-600">No content available for this page.</div>
      </div>
    );
  }

  return (
    <div className="content-renderer">
      {content
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(section => renderSection(section))
        .filter(Boolean)
      }
    </div>
  );
};

export default ContentRenderer;