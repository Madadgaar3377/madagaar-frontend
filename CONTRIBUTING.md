# Contributing to Madadgaar Expert Partner

First off, thank you for considering contributing to Madadgaar Expert Partner! It's people like you that make this platform better for everyone in Pakistan.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your communication.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

```bash
Node.js >= 14.0.0
npm >= 6.0.0
Git
```

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/madagaar-frontend.git
   cd madagaar-frontend
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/madadgaar/madagaar-frontend.git
   ```

4. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

5. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Process

### 1. Pick an Issue

- Check existing issues or create a new one
- Comment on the issue to let others know you're working on it
- Wait for approval before starting work

### 2. Development

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

### 3. Testing

- Write tests for new features
- Ensure all tests pass before submitting
- Test on multiple browsers (Chrome, Firefox, Safari)
- Test on mobile devices

### 4. Documentation

- Update README.md if needed
- Add JSDoc comments for new functions
- Update relevant documentation

## Coding Standards

### JavaScript/React

```javascript
// Use functional components with hooks
import React, { useState, useEffect } from 'react';

const MyComponent = () => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  return (
    <div className="container">
      {/* Component JSX */}
    </div>
  );
};

export default MyComponent;
```

### File Naming

- Components: `PascalCase.jsx` (e.g., `TeamMemberCard.jsx`)
- Utilities: `camelCase.js` (e.g., `apiHelpers.js`)
- Constants: `camelCase.js` (e.g., `teamMembers.js`)
- Styles: `kebab-case.css` (e.g., `custom-styles.css`)

### Component Structure

```javascript
// 1. Imports
import React from 'react';
import PropTypes from 'prop-types';

// 2. Component
const Component = ({ prop1, prop2 }) => {
  // 3. State and hooks
  const [state, setState] = useState();
  
  // 4. Event handlers
  const handleClick = () => {
    // Logic
  };
  
  // 5. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// 6. PropTypes
Component.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};

// 7. Export
export default Component;
```

### Styling with Tailwind

```jsx
// Prefer Tailwind classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-900">Title</h2>
</div>

// Use responsive classes
<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
  {/* Content */}
</div>
```

### SEO Best Practices

```jsx
import SEO from '../components/SEO';

const Page = () => (
  <>
    <SEO
      title="Page Title - Madadgaar"
      description="Detailed description (155 chars)"
      keywords="keyword1, keyword2, keyword3"
      canonicalUrl="https://madadgaar.com.pk/page"
    />
    {/* Page content */}
  </>
);
```

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```bash
feat(properties): add filter by city functionality

Add dropdown filter to properties page allowing users to filter
properties by city. Includes search functionality within dropdown.

Closes #123

---

fix(navbar): resolve mobile menu not closing on route change

Mobile navigation menu was staying open when user navigated to
a new page. Added useEffect to close menu on route change.

Fixes #456

---

docs(readme): update installation instructions

Added detailed steps for environment setup and troubleshooting
common installation issues.
```

### Commit Best Practices

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests after first line
- Be descriptive but concise

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Tested on multiple screen sizes
- [ ] All tests pass

### Submitting

1. **Update your branch**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push changes**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request**
   - Use a clear, descriptive title
   - Reference related issues
   - Describe changes in detail
   - Add screenshots for UI changes
   - List any breaking changes

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #(issue number)

## Screenshots (if applicable)
[Add screenshots here]

## Testing
- [ ] Tested locally
- [ ] Tested on mobile
- [ ] All tests passing

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
```

### Review Process

1. At least one maintainer will review your PR
2. Make requested changes
3. Request re-review
4. Once approved, it will be merged

## Project Structure

### Key Directories

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
├── constants/       # Configuration and static data
├── utils/           # Utility functions
├── Accounts/        # Authentication pages
└── compontents/     # Layout components
```

### Adding New Features

#### New Page

1. Create page component in appropriate directory
2. Add route in `App.js`
3. Add SEO component
4. Update sitemap.xml
5. Test routing and SEO

#### New Component

1. Create component file
2. Add PropTypes
3. Export and use in page
4. Add to README if reusable

## Testing

### Manual Testing Checklist

- [ ] Feature works as expected
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Different browsers
- [ ] Accessibility (keyboard navigation)
- [ ] Loading states
- [ ] Error states
- [ ] Edge cases

### Testing on Different Devices

Test on:
- Desktop (1920x1080, 1366x768)
- Tablet (768x1024)
- Mobile (375x667, 414x896)

## Documentation

### Code Documentation

```javascript
/**
 * Fetches properties with optional filters
 * @param {Object} filters - Filter options
 * @param {string} filters.city - City name
 * @param {string} filters.type - Property type
 * @param {number} filters.minPrice - Minimum price
 * @param {number} filters.maxPrice - Maximum price
 * @returns {Promise<Array>} Array of properties
 */
const fetchProperties = async (filters) => {
  // Implementation
};
```

### README Updates

When adding features, update:
- Features list
- Component documentation
- Setup instructions (if needed)
- Screenshots

## Questions?

Feel free to:
- Open an issue for questions
- Email: developer@madadgaar.com.pk
- Contact team members (see README)

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to Madadgaar Expert Partner! 🎉
