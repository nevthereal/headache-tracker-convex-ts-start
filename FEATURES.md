# Headache Tracker - Complete Feature List

## Core Features

### 1. Daily Entry Logging

- **0-5 Intensity Scale** with 0.5 increments for precision
- **Color-coded severity badges**:
  - Green: None/Mild (0-1)
  - Blue: Mild (1-2)
  - Yellow: Moderate (2-3)
  - Orange: Severe (3-4)
  - Red: Very Severe/Extreme (4-5)
- **Optional notes field** for symptoms, triggers, or observations
- **One entry per day limit** - Only one entry can be logged per calendar day
- **Automatic timestamps** - Each entry records the exact time it was created

### 2. Dashboard Analytics

- **Total Entries** - Count of all logged entries (all-time)
- **Average Score** - Mean intensity across all entries (all-time)
- **This Week - Highest** - Peak headache intensity for the past 7 days
- **This Week - Lowest** - Mildest headache intensity for the past 7 days
- **30-Day Trend Chart** - Interactive line chart showing headache patterns
  - Visual representation of last 30 days of data
  - Hover tooltips show exact scores and labels
  - Color-coded line in purple gradient

### 3. Entry Management

- **Dedicated Manage Entries page** (`/entries` route)
- **View all entries** in chronological order
- **Edit entries** - Modify both score and notes
- **Delete entries** - Permanently remove entries with confirmation
- **Full timestamp display** - Date and time for each entry
- **Inline editing** - Toggle between view and edit modes

### 4. Authentication & Security

- **Password protection** - Simple password-based access control
- **Client-side sessions** - Uses `sessionStorage` for session management
- **Automatic logout** - Session clears when browser tab is closed
- **No server-side tracking** - Session data never stored in database
- **Tab isolation** - Each tab has its own independent session

### 5. Beautiful Design

- **Gradient backgrounds** - Blue → Indigo → Purple theme
- **Smooth animations** - Loading states, button hovers, transitions
- **Responsive layout** - Works perfectly on desktop, tablet, and mobile
- **Card-based UI** - Clean, organized component design
- **Accessibility** - Semantic HTML and keyboard-friendly forms

## Technical Stack

- **Frontend**: React 19 with TypeScript
- **Framework**: TanStack Start (full-stack React framework)
- **Routing**: TanStack Router with type-safe routes
- **Backend**: Convex (backend-as-a-service)
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts for data visualization
- **Data Fetching**: TanStack Query with Convex integration
- **Session Management**: Browser `sessionStorage` API

## Pages & Routes

### `/login`

- Password entry form
- Beautiful gradient UI
- Real-time validation feedback
- Error handling and messaging

### `/` (Dashboard)

- Main tracker interface
- Statistics cards showing aggregated data
- 30-day interactive trend chart
- Entry form (if no entry for today)
- Today's entry display (if already logged)
- Links to Manage Entries and Logout

### `/entries`

- Full entry management interface
- View all entries in list format
- Edit entries inline with confirmation
- Delete entries with confirmation dialogs
- Full timestamp display
- Back navigation to dashboard

## Key Constraints & Features

1. **One Entry Per Day** - The form is blocked if an entry already exists for the current day
2. **Optional Notes** - Notes can be left blank; only intensity score is required
3. **Session Expiry** - Closing the browser tab automatically logs the user out
4. **No Account Creation** - Simple password-only authentication
5. **No Cloud Sync** - Data is stored locally in Convex deployment
6. **Responsive Design** - Adapts to all screen sizes

## Data Model

```typescript
headacheEntries {
  _id: Id                    // Auto-generated entry ID
  _creationTime: number      // Database creation timestamp
  score: number              // 0-5 intensity scale
  notes: optional(string)    // Optional user notes
  createdAt: number          // Unix timestamp when logged (0-5 scale)
}
```

## API Endpoints

### Queries

- `listEntries()` - Fetch all entries
- `getTodayEntry()` - Check if entry exists for today

### Mutations

- `addEntry(score, notes)` - Create new entry
- `updateEntry(id, score, notes)` - Modify existing entry
- `deleteEntry(id)` - Remove entry

### Actions

- `verifyPassword(password)` - Authentication

## Color Theme

- **Primary**: Purple (`#a855f7`)
- **Secondary**: Indigo (`#4f46e5`)
- **Background**: Light gradient (blue → indigo → purple)
- **Status Colors**:
  - Success/Mild: Green (`#16a34a`)
  - Info/Moderate: Blue (`#2563eb`)
  - Warning/Severe: Orange (`#ea580c`)
  - Danger/Extreme: Red (`#dc2626`)

## Browser Requirements

- Modern browser with ES2020+ support
- CSS Grid and Flexbox support
- `sessionStorage` API support
- SVG support for icons

## Performance Considerations

- Chart renders only when data exists
- Lazy loading of Recharts components
- Optimized re-renders with React hooks
- Efficient data filtering for 30-day chart
- Client-side pagination ready (future enhancement)

## Accessibility Features

- Semantic HTML structure
- ARIA labels where needed
- Keyboard-navigable forms
- High contrast text
- Clear visual feedback for interactive elements
- Loading state indicators
- Error messages clearly displayed

## Future Enhancement Ideas

- Export data as CSV
- Monthly/weekly statistics and summaries
- Multiple user accounts
- Trigger and symptom tagging system
- Medication tracking
- Email notifications
- Dark mode toggle
- Data visualization (pie charts for severity distribution)
- Trend analysis and insights
- Goal setting and tracking
- Mobile app with offline support
