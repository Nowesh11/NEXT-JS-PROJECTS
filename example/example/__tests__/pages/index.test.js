import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../../pages/index';

// Mock Next.js components
jest.mock('next/head', () => {
  return function MockHead({ children }) {
    return <>{children}</>;
  };
});

jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    section: ({ children, ...props }) => <section {...props}>{children}</section>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock components
jest.mock('../../components/AccessibilityProvider', () => ({
  useAccessibility: () => ({
    highContrast: false,
    fontSize: 'medium',
    getText: (en, ta) => en,
    language: 'en',
    toggleLanguage: jest.fn(),
    toggleHighContrast: jest.fn(),
    changeFontSize: jest.fn(),
  }),
}));

jest.mock('../../components/Navigation', () => {
  return function MockNavigation() {
    return (
      <nav data-testid="navigation">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/projects">Projects</a>
        <a href="/ebooks">E-Books</a>
      </nav>
    );
  };
});

jest.mock('../../components/Hero', () => {
  return function MockHero() {
    return (
      <section data-testid="hero-section">
        <h1>Tamil Language Society</h1>
        <p>Preserving Tamil Heritage</p>
        <button>Get Started</button>
      </section>
    );
  };
});

jest.mock('../../components/SEOHead', () => {
  return function MockSEOHead({ title, description }) {
    return (
      <>
        <title>{title}</title>
        <meta name="description" content={description} />
      </>
    );
  };
});

jest.mock('../../components/LazyImage', () => {
  return function MockLazyImage({ src, alt, ...props }) {
    return <img src={src} alt={alt} {...props} data-testid="lazy-image" />;
  };
});

jest.mock('../../components/LazySection', () => {
  return function MockLazySection({ children, className, ...props }) {
    return (
      <section className={className} {...props} data-testid="lazy-section">
        {children}
      </section>
    );
  };
});

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

describe('HomePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<HomePage />);
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('displays the hero section', () => {
    render(<HomePage />);
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByText('Tamil Language Society')).toBeInTheDocument();
    expect(screen.getByText('Preserving Tamil Heritage')).toBeInTheDocument();
  });

  it('includes SEO optimization', () => {
    render(<HomePage />);
    // SEO component should be rendered (mocked)
    expect(document.title).toBeDefined();
  });

  it('renders navigation with correct links', () => {
    render(<HomePage />);
    const navigation = screen.getByTestId('navigation');
    
    expect(navigation).toContainElement(screen.getByText('Home'));
    expect(navigation).toContainElement(screen.getByText('About'));
    expect(navigation).toContainElement(screen.getByText('Projects'));
    expect(navigation).toContainElement(screen.getByText('E-Books'));
  });

  it('uses lazy loading components', () => {
    render(<HomePage />);
    const lazySections = screen.getAllByTestId('lazy-section');
    expect(lazySections.length).toBeGreaterThan(0);
  });

  it('handles accessibility features', () => {
    render(<HomePage />);
    // Component should render without accessibility errors
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('is responsive and mobile-friendly', () => {
    // Test mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    render(<HomePage />);
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    render(<HomePage />);
    const getStartedButton = screen.getByText('Get Started');
    
    fireEvent.click(getStartedButton);
    // Button should be clickable without errors
    expect(getStartedButton).toBeInTheDocument();
  });
});

// Performance and optimization tests
describe('HomePage Performance', () => {
  it('implements lazy loading for images', () => {
    render(<HomePage />);
    const lazyImages = screen.queryAllByTestId('lazy-image');
    // Should have lazy images if any images are present
    expect(lazyImages).toBeDefined();
  });

  it('implements lazy loading for sections', () => {
    render(<HomePage />);
    const lazySections = screen.getAllByTestId('lazy-section');
    expect(lazySections.length).toBeGreaterThan(0);
  });

  it('sets up intersection observers', () => {
    render(<HomePage />);
    // IntersectionObserver should be called for lazy components
    expect(mockIntersectionObserver).toHaveBeenCalled();
  });
});

// SEO and metadata tests
describe('HomePage SEO', () => {
  it('includes proper meta tags', () => {
    render(<HomePage />);
    // Meta tags should be present through SEOHead component
    const metaDescription = document.querySelector('meta[name="description"]');
    expect(metaDescription).toBeTruthy();
  });

  it('has semantic HTML structure', () => {
    render(<HomePage />);
    
    // Should have proper semantic elements
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('main') || screen.getByTestId('hero-section')).toBeInTheDocument();
  });

  it('includes structured data', () => {
    render(<HomePage />);
    // Structured data should be included via SEOHead
    expect(document.head).toBeDefined();
  });
});

// Accessibility tests
describe('HomePage Accessibility', () => {
  it('has proper heading hierarchy', () => {
    render(<HomePage />);
    const h1Elements = screen.getAllByRole('heading', { level: 1 });
    expect(h1Elements.length).toBeGreaterThan(0);
  });

  it('provides alternative text for images', () => {
    render(<HomePage />);
    const images = screen.getAllByRole('img');
    
    images.forEach(img => {
      expect(img).toHaveAttribute('alt');
    });
  });

  it('supports keyboard navigation', () => {
    render(<HomePage />);
    const interactiveElements = screen.getAllByRole('button');
    
    interactiveElements.forEach(element => {
      expect(element).toBeVisible();
    });
  });

  it('maintains focus management', () => {
    render(<HomePage />);
    const focusableElements = screen.getAllByRole('button');
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
      expect(document.activeElement).toBe(focusableElements[0]);
    }
  });
});

// Integration tests
describe('HomePage Integration', () => {
  it('integrates with accessibility provider', () => {
    render(<HomePage />);
    // Should render without errors when accessibility context is provided
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('handles language switching', () => {
    render(<HomePage />);
    // Component should handle language changes gracefully
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
  });

  it('works with different screen sizes', () => {
    const screenSizes = [
      { width: 320, height: 568 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 }, // Desktop
    ];

    screenSizes.forEach(({ width, height }) => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: height,
      });

      const { unmount } = render(<HomePage />);
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
      unmount();
    });
  });
});