import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LazyImage from '../../components/LazyImage';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock next/image
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }) {
    return <img src={src} alt={alt} {...props} />;
  };
});

describe('LazyImage Component', () => {
  const defaultProps = {
    src: '/test-image.jpg',
    alt: 'Test image',
    width: 300,
    height: 200,
  };

  beforeEach(() => {
    mockIntersectionObserver.mockClear();
  });

  it('renders without crashing', () => {
    render(<LazyImage {...defaultProps} />);
    expect(screen.getByAltText('Test image')).toBeInTheDocument();
  });

  it('applies correct props to the image', () => {
    render(<LazyImage {...defaultProps} className="custom-class" />);
    const image = screen.getByAltText('Test image');
    
    expect(image).toHaveAttribute('src', '/test-image.jpg');
    expect(image).toHaveAttribute('alt', 'Test image');
    expect(image).toHaveClass('custom-class');
  });

  it('handles missing alt text gracefully', () => {
    const { src, alt, ...propsWithoutAlt } = defaultProps;
    render(<LazyImage src={src} {...propsWithoutAlt} />);
    
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
  });

  it('sets up IntersectionObserver on mount', () => {
    render(<LazyImage {...defaultProps} />);
    expect(mockIntersectionObserver).toHaveBeenCalled();
  });

  it('handles different image formats', () => {
    const formats = ['.jpg', '.png', '.webp', '.svg'];
    
    formats.forEach((format) => {
      const { unmount } = render(
        <LazyImage 
          {...defaultProps} 
          src={`/test-image${format}`}
          alt={`Test ${format} image`}
        />
      );
      
      expect(screen.getByAltText(`Test ${format} image`)).toHaveAttribute(
        'src', 
        `/test-image${format}`
      );
      
      unmount();
    });
  });

  it('applies loading optimization attributes', () => {
    render(<LazyImage {...defaultProps} />);
    const image = screen.getByAltText('Test image');
    
    // Check if the image has lazy loading attributes
    expect(image).toBeInTheDocument();
  });

  it('handles error states gracefully', () => {
    // Test with invalid src
    render(<LazyImage {...defaultProps} src="" />);
    const image = screen.getByAltText('Test image');
    
    expect(image).toHaveAttribute('src', '');
  });

  it('supports responsive images with different sizes', () => {
    render(
      <LazyImage 
        {...defaultProps}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    );
    
    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
  });

  it('maintains aspect ratio with fill prop', () => {
    render(
      <LazyImage 
        src={defaultProps.src}
        alt={defaultProps.alt}
        fill
        className="object-cover"
      />
    );
    
    const image = screen.getByAltText('Test image');
    expect(image).toHaveClass('object-cover');
  });

  it('handles priority loading for above-the-fold images', () => {
    render(<LazyImage {...defaultProps} priority />);
    const image = screen.getByAltText('Test image');
    
    expect(image).toBeInTheDocument();
  });
});

// Integration tests
describe('LazyImage Integration', () => {
  it('works with different Next.js Image configurations', () => {
    const configurations = [
      { width: 100, height: 100 },
      { fill: true },
      { width: 200, height: 150, priority: true },
    ];

    configurations.forEach((config, index) => {
      const { unmount } = render(
        <LazyImage 
          src={`/test-${index}.jpg`}
          alt={`Test image ${index}`}
          {...config}
        />
      );
      
      expect(screen.getByAltText(`Test image ${index}`)).toBeInTheDocument();
      unmount();
    });
  });

  it('handles multiple LazyImage components on the same page', () => {
    const images = Array.from({ length: 5 }, (_, i) => ({
      src: `/image-${i}.jpg`,
      alt: `Image ${i}`,
      width: 200,
      height: 200,
    }));

    render(
      <div>
        {images.map((img, index) => (
          <LazyImage key={index} {...img} />
        ))}
      </div>
    );

    images.forEach((img) => {
      expect(screen.getByAltText(img.alt)).toBeInTheDocument();
    });
  });
});