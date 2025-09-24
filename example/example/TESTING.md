# Testing Guide for Tamil Language Society Frontend

This document provides comprehensive information about the testing setup and practices for the Tamil Language Society frontend application.

## Testing Stack

Our testing strategy includes multiple layers of testing to ensure code quality, functionality, and user experience:

### 1. Unit Testing
- **Framework**: Jest with React Testing Library
- **Purpose**: Test individual components and functions in isolation
- **Location**: `__tests__/components/`

### 2. Integration Testing
- **Framework**: Jest with React Testing Library
- **Purpose**: Test component interactions and page-level functionality
- **Location**: `__tests__/pages/`

### 3. End-to-End Testing
- **Framework**: Playwright
- **Purpose**: Test complete user workflows across different browsers
- **Location**: `__tests__/e2e/`

## Getting Started

### Prerequisites

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install Playwright Browsers** (for E2E tests)
   ```bash
   npx playwright install
   ```

### Running Tests

#### Unit and Integration Tests

```bash
# Run all unit/integration tests
npm run test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD
npm run test:ci

# Debug tests
npm run test:debug
```

#### End-to-End Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode
npm run test:e2e:ui

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug

# Run all tests (unit + E2E)
npm run test:all
```

## Test Structure

### Unit Tests

Unit tests are located in `__tests__/components/` and follow this naming convention:
- `ComponentName.test.js`

Example structure:
```javascript
import { render, screen } from '@testing-library/react';
import ComponentName from '../../components/ComponentName';

describe('ComponentName', () => {
  it('renders without crashing', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Integration Tests

Integration tests are located in `__tests__/pages/` and test complete page functionality:
- `pagename.test.js`

### E2E Tests

E2E tests are located in `__tests__/e2e/` and follow this naming convention:
- `feature.spec.js`

Example structure:
```javascript
const { test, expect } = require('@playwright/test');

test.describe('Feature Tests', () => {
  test('should perform user action', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

## Testing Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names that explain the expected behavior
- Follow the AAA pattern: Arrange, Act, Assert

### 2. Component Testing
- Test component behavior, not implementation details
- Use semantic queries (getByRole, getByLabelText) over brittle selectors
- Test user interactions and edge cases
- Mock external dependencies

### 3. Accessibility Testing
- Ensure all interactive elements are keyboard accessible
- Verify proper ARIA labels and roles
- Test with screen reader compatibility in mind

### 4. Performance Testing
- Test lazy loading functionality
- Verify image optimization
- Check for memory leaks in long-running tests

## Coverage Requirements

We maintain the following coverage thresholds:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

Coverage reports are generated in the `coverage/` directory.

## Mocking Strategy

### External Dependencies
- Next.js components (Image, Link, Head) are mocked
- Framer Motion animations are mocked for performance
- IntersectionObserver and ResizeObserver are polyfilled

### API Calls
- Use MSW (Mock Service Worker) for API mocking in integration tests
- Mock fetch calls in unit tests

## Continuous Integration

Tests are configured to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    npm run test:ci
    npm run test:e2e
```

## Debugging Tests

### Unit/Integration Tests
1. Use `test:debug` script for debugging
2. Add `console.log` statements for debugging
3. Use `screen.debug()` to see rendered HTML
4. Use `--detectOpenHandles` to find async issues

### E2E Tests
1. Use `test:e2e:debug` for step-by-step debugging
2. Use `test:e2e:headed` to see browser actions
3. Check screenshots and videos in `test-results/`
4. Use Playwright's trace viewer for detailed analysis

## Test Data Management

### Mock Data
- Store mock data in `__tests__/__mocks__/`
- Use factories for generating test data
- Keep test data minimal and focused

### Test Utilities
- Common test utilities are in `jest.setup.js`
- Use custom render functions for providers
- Create helper functions for common test patterns

## Performance Considerations

### Test Performance
- Use `jest.setTimeout()` for long-running tests
- Implement proper cleanup in `afterEach`/`afterAll`
- Use `jest.clearAllMocks()` to prevent test interference

### Parallel Execution
- Unit tests run in parallel by default
- E2E tests are configured for optimal parallelization
- Use `--maxWorkers` to control resource usage

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout values
   - Check for unresolved promises
   - Ensure proper cleanup

2. **Flaky E2E tests**
   - Add proper wait conditions
   - Use `waitFor` instead of fixed delays
   - Check for race conditions

3. **Memory leaks**
   - Use `--detectOpenHandles`
   - Ensure proper component unmounting
   - Clear timers and intervals

### Getting Help

- Check test logs for detailed error messages
- Use debugging tools and breakpoints
- Review test artifacts (screenshots, videos, traces)
- Consult the team's testing guidelines

## Contributing

When adding new features:
1. Write tests before implementing features (TDD)
2. Ensure all tests pass before submitting PR
3. Maintain or improve coverage percentages
4. Update this documentation for new testing patterns

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)