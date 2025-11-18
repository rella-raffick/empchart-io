# EmpChartIO - Frontend Technical Plan

## Project Overview

**EmpChartIO** - An interactive employee organization chart application with drag & drop functionality to visualize and update organizational hierarchy in real-time.

---

## Core Requirements

### Functional Requirements
1. Display hierarchical organization chart based on manager-employee relationships
2. Drag & drop employees to reassign managers
3. Real-time chart re-rendering after updates
4. Persist changes to backend database
5. User authentication and authorization
6. Employee search and filtering
7. Employee statistics dashboard

### Visual Requirements (from sample-org.png)
- Clean, modern UI with dotted background pattern
- Card-based employee nodes with avatar, name, and designation
- Purple numbered badges showing hierarchy levels
- Connecting lines between manager and reports
- Top-right user profile dropdown
- Bottom action bar with view toggles and filters
- Total collaborators count display
- "Détails" (Details) links on employee cards

---

## Tech Stack

### Core Technologies
- **React 18+** - UI library
- **Redux Toolkit** - State management
- **React Router v6** - Client-side routing
- **SCSS** - Styling with CSS preprocessing
- **Custom CSS** - Component-specific styles

### Additional Libraries

#### Org Chart Visualization
- **@dabeng/react-orgchart** or **react-organizational-chart**
  - For hierarchical tree layout
  - Visual connections between nodes

#### Drag & Drop
- **@dnd-kit/core** (preferred) or **react-beautiful-dnd**
  - Smooth drag & drop interactions
  - Touch device support
  - Accessibility features

#### HTTP & API
- **Axios** - HTTP client
  - Interceptors for auth tokens
  - Request/response transformation
  - Error handling

#### UI Components & Utilities
- **clsx** - Conditional className utility
- **react-toastify** - Toast notifications
- **react-loader-spinner** - Loading indicators
- **date-fns** - Date formatting

#### Avatar Generation
- **DiceBear API** or **UI Avatars**
  - Generate profile avatars from names
  - Consistent with backend profileImage URLs

---

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   ├── Avatar/
│   │   │   ├── Modal/
│   │   │   ├── Loader/
│   │   │   └── Dropdown/
│   │   ├── layout/
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   ├── Footer/
│   │   │   └── MainLayout/
│   │   └── orgChart/
│   │       ├── OrgChartContainer/
│   │       ├── EmployeeNode/
│   │       ├── ConnectionLines/
│   │       ├── DraggableEmployee/
│   │       ├── DropZone/
│   │       └── ChartControls/
│   ├── pages/
│   │   ├── Login/
│   │   ├── Register/
│   │   ├── Dashboard/
│   │   ├── OrgChart/
│   │   ├── EmployeeDetails/
│   │   ├── EmployeeList/
│   │   └── NotFound/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── authSlice.ts
│   │   │   ├── authAPI.ts
│   │   │   └── authTypes.ts
│   │   ├── employees/
│   │   │   ├── employeesSlice.ts
│   │   │   ├── employeesAPI.ts
│   │   │   └── employeesTypes.ts
│   │   └── orgChart/
│   │       ├── orgChartSlice.ts
│   │       ├── orgChartAPI.ts
│   │       └── orgChartTypes.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── useOrgChart.ts
│   ├── routes/
│   │   ├── AppRoutes.tsx
│   │   ├── PrivateRoute.tsx
│   │   └── PublicRoute.tsx
│   ├── services/
│   │   ├── api.ts (axios instance)
│   │   ├── authService.ts
│   │   ├── employeeService.ts
│   │   └── chartService.ts
│   ├── store/
│   │   ├── index.ts (store configuration)
│   │   └── rootReducer.ts
│   ├── styles/
│   │   ├── abstracts/
│   │   │   ├── _variables.scss
│   │   │   ├── _mixins.scss
│   │   │   └── _functions.scss
│   │   ├── base/
│   │   │   ├── _reset.scss
│   │   │   ├── _typography.scss
│   │   │   └── _global.scss
│   │   ├── components/
│   │   │   └── (component-specific SCSS)
│   │   ├── layout/
│   │   │   └── (layout SCSS)
│   │   └── main.scss (imports all)
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── validators.ts
│   │   └── chartHelpers.ts
│   ├── types/
│   │   ├── employee.ts
│   │   ├── user.ts
│   │   └── api.ts
│   ├── App.tsx
│   ├── App.scss
│   └── index.tsx
├── .env.development
├── .env.production
├── package.json
├── tsconfig.json
└── README.md
```

---

## Design System

### Color Palette (from sample image)
```scss
// Primary Colors
$primary-purple: #7C3AED;      // Badge/accent color
$primary-blue: #6366F1;         // Links and buttons

// Neutral Colors
$background-dots: #F3F4F6;      // Dotted background
$card-background: #FFFFFF;
$text-primary: #1F2937;
$text-secondary: #6B7280;
$border-color: #E5E7EB;

// Status Colors
$success: #10B981;
$warning: #F59E0B;
$error: #EF4444;
$info: #3B82F6;
```

### Typography
```scss
$font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
$font-weights: (
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700
);
```

### Spacing Scale
```scss
$spacing: (
  xs: 0.25rem,  // 4px
  sm: 0.5rem,   // 8px
  md: 1rem,     // 16px
  lg: 1.5rem,   // 24px
  xl: 2rem,     // 32px
  2xl: 3rem     // 48px
);
```

---

## Authentication Flow

### Routes Protection
```
Public Routes:
- /login
- /register

Protected Routes:
- /dashboard
- /org-chart
- /employees
- /employees/:id
- /profile
```

### Token Management
1. Store JWT token in localStorage
2. Attach token to every API request via Axios interceptor
3. Redirect to login on 401 Unauthorized
4. Auto-logout on token expiration
5. Refresh token on app load

---

## Redux State Structure

```typescript
{
  auth: {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean,
    loading: boolean,
    error: string | null
  },
  employees: {
    list: Employee[],
    currentEmployee: Employee | null,
    loading: boolean,
    error: string | null,
    filters: {
      department: string | null,
      level: string | null,
      search: string
    }
  },
  orgChart: {
    hierarchy: OrgChartNode | null,
    loading: boolean,
    error: string | null,
    viewMode: 'team' | 'individual',
    expandedNodes: number[],
    draggedEmployee: Employee | null
  },
  ui: {
    sidebarOpen: boolean,
    modalOpen: boolean,
    notifications: Notification[]
  }
}
```

---

## Key Features Implementation

### 1. Organization Chart Display

#### Component: `OrgChartContainer`
**Purpose:** Render hierarchical organization chart

**Key Functionality:**
- Fetch hierarchy data from `GET /api/employees/hierarchy`
- Transform flat employee list into tree structure
- Render using org chart library
- Handle zoom/pan controls
- Display total employee count

**Props:**
```typescript
interface OrgChartContainerProps {
  viewMode: 'full' | 'department' | 'team';
  onNodeClick: (employeeId: number) => void;
}
```

#### Component: `EmployeeNode`
**Purpose:** Individual employee card in chart

**Visual Elements:**
- Avatar (from profileImage or generated)
- Name
- Designation
- Department badge
- Level indicator (numbered purple badge)
- "Details" link
- Hover effects
- Direct reports count

**CSS Implementation:**
```scss
.employee-node {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 16px;

  &__avatar {
    // Custom avatar styling
  }

  &__info {
    // Name and designation
  }

  &__badge {
    // Purple numbered badge
  }
}
```

---

### 2. Drag & Drop Functionality

#### Component: `DraggableEmployee`
**Purpose:** Wrap employee nodes with drag functionality

**Implementation using @dnd-kit:**
```typescript
import { useDraggable } from '@dnd-kit/core';

const DraggableEmployee = ({ employee, children }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: employee.id,
    data: employee
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      {children}
    </div>
  );
};
```

#### Component: `DropZone`
**Purpose:** Define valid drop targets (other employees)

**Validation Rules:**
- Cannot drop on self
- Cannot drop on own subordinates (prevent circular)
- Must be in same department (backend validation)
- Show visual feedback on hover

**On Drop:**
1. Call `PATCH /api/employees/:id/manager` with new managerId
2. Show loading state
3. On success: Update Redux state + re-render chart
4. On error: Show error toast + revert UI

---

### 3. Employee Search & Filter

#### Component: `ChartControls`
**Purpose:** Bottom action bar with filters

**Features:**
- Search by name (debounced)
- Filter by department dropdown
- Filter by level dropdown
- View mode toggle (team/individual)
- Reset filters button

**API Calls:**
- Search: `GET /api/employees/search?search={term}`
- Filter: `GET /api/employees/filter/department?department={code}`
- Level: `GET /api/employees/filter/level?level={level}`

---

### 4. Employee Details Modal

#### Component: `EmployeeDetailsModal`
**Purpose:** Show full employee information

**Data Displayed:**
- Profile photo
- Full name
- Email
- Phone
- Designation & Department
- Level & Role
- Hire date
- Manager (with link)
- Direct reports (with links)
- Breadcrumb path to CEO

**Actions:**
- Edit employee (PATCH /api/employees/:id)
- Delete employee (DELETE /api/employees/:id)
- View full hierarchy (GET /api/employees/:id/hierarchy)

---

### 5. Registration Flow

#### Page: `Register`
**Purpose:** New employee registration

**Form Fields:**
```typescript
{
  name: string;
  email: string;
  password: string;
  department: 'ENG' | 'SALES' | 'HR' | 'FIN' | 'EXECUTIVE';
  designation: string; // Dropdown from GET /api/designations
  phone: string;
  profileImage: string; // Optional, auto-generate from name
}
```

**Flow:**
1. Select department → Load designations for that department
2. Select designation → Auto-assigns level/role on backend
3. Submit → Creates user + employee in one transaction
4. Auto-login → Redirect to dashboard

---

## Custom CSS Components

### Dotted Background Pattern
```css
.org-chart-background {
  background-image: radial-gradient(circle, #d1d5db 1px, transparent 1px);
  background-size: 20px 20px;
  background-color: #f9fafb;
}
```

### Connection Lines
```scss
.connection-line {
  position: absolute;
  background: #e5e7eb;

  &--vertical {
    width: 2px;
  }

  &--horizontal {
    height: 2px;
  }

  &--active {
    background: $primary-purple;
  }
}
```

### Level Badge
```scss
.level-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: $primary-purple;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(124, 58, 237, 0.3);
}
```

### Employee Card Hover
```scss
.employee-card {
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);

    .employee-card__details {
      color: $primary-blue;
    }
  }

  &--dragging {
    opacity: 0.5;
    cursor: grabbing;
  }

  &--drop-target {
    border: 2px dashed $primary-purple;
    background: rgba(124, 58, 237, 0.05);
  }
}
```

---

## API Integration

### Axios Setup
```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### API Endpoints Used

#### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
```

#### Employees
```
GET    /api/employees
GET    /api/employees/:id
PATCH  /api/employees/:id
DELETE /api/employees/:id
```

#### Hierarchy
```
GET    /api/employees/hierarchy
GET    /api/employees/:id/hierarchy
GET    /api/employees/:id/path
```

#### Manager Operations
```
PATCH  /api/employees/:id/manager
GET    /api/employees/:id/reports
```

#### Filters
```
GET    /api/employees/filter/department?department={code}
GET    /api/employees/filter/level?level={level}
GET    /api/employees/search?search={term}
```

#### Statistics
```
GET    /api/employees/stats/overview
```

#### Designations
```
GET    /api/designations
GET    /api/designations/department/{code}
```

---

## User Experience Considerations

### Loading States
- Skeleton loaders for org chart
- Spinner for drag operations
- Progressive loading for large hierarchies

### Error Handling
- Toast notifications for API errors
- Inline validation errors
- Network error recovery
- Graceful fallbacks

### Responsive Design
- Desktop-first (org chart complexity)
- Tablet: Simplified view
- Mobile: List view instead of chart

### Accessibility
- Keyboard navigation for drag & drop
- ARIA labels for screen readers
- Focus management in modals
- Color contrast compliance

### Performance Optimization
- Virtual scrolling for large employee lists
- Memoization of org chart nodes
- Debounced search input
- Lazy loading of employee details
- Redux selector optimization

---

## Package.json Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    "axios": "^1.6.2",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dabeng/react-orgchart": "^2.2.0",
    "react-toastify": "^9.1.3",
    "react-loader-spinner": "^6.1.0",
    "clsx": "^2.0.0",
    "date-fns": "^3.0.0",
    "sass": "^1.69.5"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@types/react-router-dom": "^5.3.3",
    "typescript": "^5.3.3",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "eslint": "^8.55.0",
    "prettier": "^3.1.1"
  }
}
```

---

## Development Workflow

### Phase 1: Setup (Week 1)
- [ ] Create React app with Vite + TypeScript
- [ ] Setup Redux Toolkit + React Router
- [ ] Configure SCSS + CSS architecture
- [ ] Setup Axios interceptors
- [ ] Create folder structure

### Phase 2: Authentication (Week 1)
- [ ] Build Login page
- [ ] Build Registration page
- [ ] Implement auth Redux slice
- [ ] Setup protected routes
- [ ] Add token management

### Phase 3: UI Components (Week 2)
- [ ] Build common components (Button, Input, Card, etc.)
- [ ] Build layout components (Header, Sidebar)
- [ ] Create employee card component
- [ ] Implement avatar system
- [ ] Style with custom CSS + SCSS

### Phase 4: Org Chart (Week 2-3)
- [ ] Integrate org chart library
- [ ] Build hierarchy transformation logic
- [ ] Implement connection lines
- [ ] Add zoom/pan controls
- [ ] Style chart with custom CSS

### Phase 5: Drag & Drop (Week 3)
- [ ] Setup @dnd-kit
- [ ] Make employee nodes draggable
- [ ] Create drop zones
- [ ] Implement validation logic
- [ ] Add visual feedback
- [ ] Connect to API

### Phase 6: Features (Week 4)
- [ ] Employee search
- [ ] Department/level filters
- [ ] Employee details modal
- [ ] Statistics dashboard
- [ ] Employee list view

### Phase 7: Polish (Week 4-5)
- [ ] Error handling
- [ ] Loading states
- [ ] Animations
- [ ] Responsive design
- [ ] Accessibility
- [ ] Performance optimization

### Phase 8: Testing & Deploy
- [ ] Unit tests for Redux
- [ ] Component tests
- [ ] E2E tests for drag & drop
- [ ] Build for production
- [ ] Deploy to hosting

---

## Testing Strategy

### Unit Tests
- Redux reducers and actions
- Utility functions
- API service methods

### Component Tests
- Employee card rendering
- Form validation
- Modal interactions

### Integration Tests
- Auth flow
- Employee CRUD operations
- Drag & drop with API

### E2E Tests (Cypress/Playwright)
- Complete user journey
- Drag & drop scenarios
- Error handling

---

## Environment Variables

```bash
# .env.development
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENV=development

# .env.production
REACT_APP_API_URL=https://api.yourapp.com/api
REACT_APP_ENV=production
```

---

## Code Quality

### ESLint Configuration
- React hooks rules
- TypeScript strict mode
- Accessibility plugin
- Import order

### Prettier Configuration
- Single quotes
- 2 spaces indentation
- Trailing commas
- Line width 100

### Git Hooks (Husky)
- Pre-commit: Lint & format
- Pre-push: Run tests

---

## Success Metrics

### Performance
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Lighthouse score > 90

### Code Quality
- Test coverage > 80%
- No ESLint errors
- TypeScript strict mode

### User Experience
- Drag operation < 100ms response
- Chart re-render < 500ms
- Search results < 300ms

---

## Resources

### Documentation Links
- [React Org Chart Library](https://www.npmjs.com/package/@dabeng/react-orgchart)
- [dnd-kit Documentation](https://docs.dndkit.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Router v6](https://reactrouter.com/)

### Design References
- Sample org chart image: `/frontend/sample-org.png`
- Backend API docs: `EmpChartIO_API.postman_collection.json`

---

## Backend Readiness Checklist

### API Endpoints
- [x] Authentication (login, register, me)
- [x] Employee CRUD
- [x] Hierarchy endpoints
- [x] Manager update endpoint (drag & drop)
- [x] Search & filters
- [x] Statistics

### Data Model
- [x] User table with auth
- [x] Employee table with managerId
- [x] Designation & Department tables
- [x] Proper relationships

### Security
- [x] JWT authentication
- [x] Password hashing
- [x] Rate limiting
- [x] CORS configuration

### Data Integrity
- [x] Manager validation (same department)
- [x] Circular reference prevention
- [x] Cascade handling

**Backend Status: READY FOR FRONTEND DEVELOPMENT**

---

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Setup development environment** (Node, Git, IDE)
3. **Initialize React project** with Vite
4. **Install dependencies** from package.json
5. **Start with Phase 1** (Setup)
6. **Follow weekly milestones** outlined above

---

**Document Version:** 1.0
**Last Updated:** 2025-01-18
**Author:** Tech Lead
**Status:** Ready for Implementation
