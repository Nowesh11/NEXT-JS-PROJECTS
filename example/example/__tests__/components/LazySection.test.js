import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LazySection from '../../components/LazySection';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    section: React.forwardRef(({ children, ...props }, ref) => (
      <section ref={ref} {...props}>
        {children}
      </section>
    )),
  },
}));

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

describe('LazySection Component', () => {
  const defaultProps = {
    children: <div>Test content</div>,
    className: 'test-class',
  };

  beforeEach(() => {
    mockIntersectionObserver.mockClear();
  });

  it('renders without crashing', () => {
    render(<LazySection {...defaultProps} />);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies correct className', () => {
    render(<LazySection {...defaultProps} />);
    const section = screen.getByText('Test content').closest('section');
    expect(section).toHaveClass('test-class');
  });

  it('renders children correctly', () => {
    const children = (
      <div>
        <h1>Title</h1>
        <p>Description</p>
      </div>
    );
    
    render(<LazySection className="wrapper">{children}</LazySection>);
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('sets up IntersectionObserver on mount', () => {
    render(<LazySection {...defaultProps} />);
    expect(mockIntersectionObserver).toHaveBeenCalled();
  });

  it('handles animationDelay prop', () => {
    render(
      <LazySection 
        {...defaultProps} 
        animationDelay={0.5}
      />
    );
    
    const section = screen.getByText('Test content').closest('section');
    expect(section).toBeInTheDocument();
  });

  it('works without className prop', () => {
    render(
      <LazySection animationDelay={0.2}>
        <div>Content without class</div>
      </LazySection>
    );
    
    expect(screen.getByText('Content without class')).toBeInTheDocument();
  });

  it('handles multiple children', () => {
    render(
      <LazySection className="multi-child">
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </LazySection>
    );
    
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('handles complex nested content', () => {
    const complexContent = (
      <div>
        <header>
          <h1>Section Title</h1>
          <nav>
            <a href="#">Link 1</a>
            <a href="#">Link 2</a>
          </nav>
        </header>
        <main>
          <article>
            <h2>Article Title</h2>
            <p>Article content</p>
          </article>
        </main>
        <footer>
          <p>Footer content</p>
        </footer>
      </div>
    );
    
    render(
      <LazySection className="complex-section">
        {complexContent}
      </LazySection>
    );
    
    expect(screen.getByText('Section Title')).toBeInTheDocument();
    expect(screen.getByText('Link 1')).toBeInTheDocument();
    expect(screen.getByText('Article Title')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('maintains proper DOM structure', () => {
    render(
      <LazySection className="outer-section">
        <div className="inner-container">
          <h1>Heading</h1>
          <section className="nested-section">
            <p>Nested content</p>
          </section>
        </div>
      </LazySection>
    );
    
    const outerSection = screen.getByText('Heading').closest('section');
    const innerContainer = screen.getByText('Heading').closest('.inner-container');
    const nestedSection = screen.getByText('Nested content').closest('.nested-section');
    
    expect(outerSection).toHaveClass('outer-section');
    expect(innerContainer).toBeInTheDocument();
    expect(nestedSection).toBeInTheDocument();
  });
});

// Animation and Intersection Observer tests
describe('LazySection Animation and Visibility', () => {
  let mockObserve;
  let mockUnobserve;
  let mockDisconnect;
  let observerCallback;

  beforeEach(() => {
    mockObserve = jest.fn();
    mockUnobserve = jest.fn();
    mockDisconnect = jest.fn();
    
    mockIntersectionObserver.mockImplementation((callback) => {
      observerCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      };
    });
  });

  it('observes the section element', () => {
    render(
      <LazySection className="observed-section">
        <div>Observable content</div>
      </LazySection>
    );
    
    expect(mockObserve).toHaveBeenCalled();
  });

  it('handles intersection changes', async () => {
    render(
      <LazySection className="intersection-section">
        <div>Intersection content</div>
      </LazySection>
    );
    
    // Simulate intersection
    if (observerCallback) {
      observerCallback([
        {
          isIntersecting: true,
          target: screen.getByText('Intersection content').closest('section'),
        },
      ]);
    }
    
    await waitFor(() => {
      expect(screen.getByText('Intersection content')).toBeInTheDocument();
    });
  });

  it('cleans up observer on unmount', () => {
    const { unmount } = render(
      <LazySection className="cleanup-section">
        <div>Cleanup content</div>
      </LazySection>
    );
    
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('handles different animation delays', () => {
    const delays = [0, 0.2, 0.5, 1.0];
    
    delays.forEach((delay, index) => {
      const { unmount } = render(
        <LazySection 
          className={`delay-section-${index}`}
          animationDelay={delay}
        >
          <div>Delayed content {index}</div>
        </LazySection>
      );
      
      expect(screen.getByText(`Delayed content ${index}`)).toBeInTheDocument();
      unmount();
    });
  });
});

// Integration tests
describe('LazySection Integration', () => {
  it('works with multiple LazySection components', () => {
    render(
      <div>
        <LazySection className="section-1" animationDelay={0.1}>
          <div>Section 1 content</div>
        </LazySection>
        <LazySection className="section-2" animationDelay={0.2}>
          <div>Section 2 content</div>
        </LazySection>
        <LazySection className="section-3" animationDelay={0.3}>
          <div>Section 3 content</div>
        </LazySection>
      </div>
    );
    
    expect(screen.getByText('Section 1 content')).toBeInTheDocument();
    expect(screen.getByText('Section 2 content')).toBeInTheDocument();
    expect(screen.getByText('Section 3 content')).toBeInTheDocument();
  });

  it('handles dynamic content updates', () => {
    const { rerender } = render(
      <LazySection className="dynamic-section">
        <div>Initial content</div>
      </LazySection>
    );
    
    expect(screen.getByText('Initial content')).toBeInTheDocument();
    
    rerender(
      <LazySection className="dynamic-section">
        <div>Updated content</div>
      </LazySection>
    );
    
    expect(screen.getByText('Updated content')).toBeInTheDocument();
    expect(screen.queryByText('Initial content')).not.toBeInTheDocument();
  });
});