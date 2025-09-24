import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    if (typeof window !== 'undefined') {
      // Log to localStorage for debugging
      const errorLog = {
        error: error.toString(),
        errorInfo: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      try {
        const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
        existingLogs.push(errorLog);
        // Keep only last 10 errors
        const recentLogs = existingLogs.slice(-10);
        localStorage.setItem('errorLogs', JSON.stringify(recentLogs));
      } catch (e) {
        console.error('Failed to log error to localStorage:', e);
      }
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            
            <h1>Oops! Something went wrong</h1>
            
            <p className="error-message">
              We're sorry, but something unexpected happened. 
              Please try refreshing the page or contact support if the problem persists.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Mode)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div className="error-actions">
              <button onClick={this.handleRetry} className="retry-btn primary">
                <i className="fas fa-redo"></i>
                Try Again
              </button>
              
              <button onClick={this.handleReload} className="retry-btn secondary">
                <i className="fas fa-refresh"></i>
                Reload Page
              </button>
            </div>
            
            <div className="error-help">
              <p>If this problem continues, please:</p>
              <ul>
                <li>Check your internet connection</li>
                <li>Clear your browser cache</li>
                <li>Try using a different browser</li>
                <li>Contact our support team</li>
              </ul>
            </div>
          </div>

          <style jsx>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              background: var(--bg-primary, #ffffff);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .error-content {
              max-width: 600px;
              text-align: center;
              background: var(--bg-secondary, #f8fafc);
              padding: 3rem 2rem;
              border-radius: 1rem;
              border: 1px solid var(--border-light, #e2e8f0);
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }

            .error-icon {
              font-size: 4rem;
              color: var(--error-color, #ef4444);
              margin-bottom: 1.5rem;
            }

            .error-content h1 {
              color: var(--text-primary, #1a1a1a);
              font-size: 2rem;
              font-weight: 700;
              margin-bottom: 1rem;
              line-height: 1.2;
            }

            .error-message {
              color: var(--text-secondary, #666666);
              font-size: 1.1rem;
              line-height: 1.6;
              margin-bottom: 2rem;
            }

            .error-details {
              text-align: left;
              margin: 2rem 0;
              background: var(--bg-tertiary, #f1f5f9);
              border-radius: 0.5rem;
              border: 1px solid var(--border-light, #e2e8f0);
            }

            .error-details summary {
              padding: 1rem;
              cursor: pointer;
              font-weight: 600;
              color: var(--text-primary, #1a1a1a);
              border-bottom: 1px solid var(--border-light, #e2e8f0);
            }

            .error-details summary:hover {
              background: var(--hover-bg, #e2e8f0);
            }

            .error-stack {
              padding: 1rem;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              font-size: 0.875rem;
              line-height: 1.4;
              color: var(--text-secondary, #666666);
              background: var(--bg-primary, #ffffff);
              border-radius: 0.25rem;
              margin: 0;
              overflow-x: auto;
              white-space: pre-wrap;
              word-break: break-word;
            }

            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              margin-bottom: 2rem;
              flex-wrap: wrap;
            }

            .retry-btn {
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              padding: 0.875rem 1.5rem;
              border: none;
              border-radius: 0.5rem;
              font-weight: 600;
              font-size: 1rem;
              cursor: pointer;
              transition: all 0.3s ease;
              text-decoration: none;
              min-width: 140px;
              justify-content: center;
            }

            .retry-btn.primary {
              background: var(--primary-blue, #2563eb);
              color: white;
            }

            .retry-btn.primary:hover {
              background: var(--primary-blue-dark, #1d4ed8);
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            }

            .retry-btn.secondary {
              background: var(--bg-tertiary, #f1f5f9);
              color: var(--text-primary, #1a1a1a);
              border: 1px solid var(--border-light, #e2e8f0);
            }

            .retry-btn.secondary:hover {
              background: var(--hover-bg, #e2e8f0);
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            .retry-btn:active {
              transform: translateY(0);
            }

            .error-help {
              text-align: left;
              background: var(--bg-tertiary, #f1f5f9);
              padding: 1.5rem;
              border-radius: 0.5rem;
              border: 1px solid var(--border-light, #e2e8f0);
            }

            .error-help p {
              color: var(--text-primary, #1a1a1a);
              font-weight: 600;
              margin-bottom: 0.75rem;
            }

            .error-help ul {
              color: var(--text-secondary, #666666);
              margin: 0;
              padding-left: 1.25rem;
            }

            .error-help li {
              margin-bottom: 0.5rem;
              line-height: 1.5;
            }

            /* Dark theme styles */
            [data-theme="dark"] .error-boundary {
              background: var(--bg-primary, #1a1a1a);
            }

            [data-theme="dark"] .error-content {
              background: var(--bg-secondary, #2a2a2a);
              border-color: var(--border-dark, #404040);
            }

            [data-theme="dark"] .error-content h1 {
              color: var(--text-primary, #ffffff);
            }

            [data-theme="dark"] .error-message {
              color: var(--text-secondary, #a0a0a0);
            }

            [data-theme="dark"] .error-details {
              background: var(--bg-tertiary, #333333);
              border-color: var(--border-dark, #404040);
            }

            [data-theme="dark"] .error-details summary {
              color: var(--text-primary, #ffffff);
              border-bottom-color: var(--border-dark, #404040);
            }

            [data-theme="dark"] .error-stack {
              background: var(--bg-primary, #1a1a1a);
              color: var(--text-secondary, #a0a0a0);
            }

            [data-theme="dark"] .retry-btn.secondary {
              background: var(--bg-tertiary, #333333);
              color: var(--text-primary, #ffffff);
              border-color: var(--border-dark, #404040);
            }

            [data-theme="dark"] .error-help {
              background: var(--bg-tertiary, #333333);
              border-color: var(--border-dark, #404040);
            }

            [data-theme="dark"] .error-help p {
              color: var(--text-primary, #ffffff);
            }

            [data-theme="dark"] .error-help ul {
              color: var(--text-secondary, #a0a0a0);
            }

            /* Responsive design */
            @media (max-width: 768px) {
              .error-boundary {
                padding: 1rem;
              }

              .error-content {
                padding: 2rem 1.5rem;
              }

              .error-content h1 {
                font-size: 1.5rem;
              }

              .error-message {
                font-size: 1rem;
              }

              .error-actions {
                flex-direction: column;
                align-items: center;
              }

              .retry-btn {
                width: 100%;
                max-width: 280px;
              }

              .error-icon {
                font-size: 3rem;
              }
            }

            /* Accessibility improvements */
            @media (prefers-reduced-motion: reduce) {
              .retry-btn {
                transition: none;
              }

              .retry-btn:hover {
                transform: none;
              }
            }

            /* Focus styles for accessibility */
            .retry-btn:focus {
              outline: 2px solid var(--primary-blue, #2563eb);
              outline-offset: 2px;
            }

            .error-details summary:focus {
              outline: 2px solid var(--primary-blue, #2563eb);
              outline-offset: 2px;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;