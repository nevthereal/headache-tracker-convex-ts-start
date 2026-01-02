# Headache Tracker Setup Guide

## Overview

This is a beautiful, password-protected headache tracker built with:

- **TanStack Start** - Full-stack React framework
- **Convex** - Backend database and functions
- **Tailwind CSS** - Beautiful styling
- **Session-based authentication** - Password protection with session cookies

## Features

✨ **Beautiful UI** - Gradient backgrounds, smooth animations, and responsive design
📊 **Track Headaches** - Log intensity scores (0-5 scale) and optional notes
📈 **Visual Analytics** - Interactive chart showing trends over the last 30 days
📋 **Daily Entry Limit** - Only one entry per day to keep tracking simple
✏️ **Editable Entries** - Manage all your entries on a dedicated page
🔐 **Password Protected** - Simple client-side session-based authentication
🗑️ **Manage Entries** - Edit or delete entries as needed
⏰ **Timestamp Management** - Automatic timestamps with full date/time display
📱 **Responsive** - Works on desktop, tablet, and mobile

## Setup Instructions

### 1. Set the Password Environment Variable

Before running the app, set your password in the Convex environment variables:

```bash
npx convex env set HEADACHE_PASSWORD "your-secret-password"
```

Replace `your-secret-password` with your actual password. This will be verified when logging in.

### 2. Development

Start the development server:

```bash
npm run dev
```

This will:

- Start the Vite dev server (frontend)
- Start Convex local backend

### 3. Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

You'll be redirected to the login page. Enter your password to access the tracker.

## Usage

### Login

1. Navigate to the app
2. You'll see a beautiful login page
3. Enter your password
4. Click "Sign In"

### Dashboard

The main dashboard shows:

- **Statistics cards**:
  - Total Entries (all-time)
  - Average Score (all-time)
  - This Week - Highest score
  - This Week - Lowest score
- **Interactive chart** - 30-day trend visualization showing your headache patterns
- **Entry form** (if no entry for today) - Log today's headache
- **Today's entry display** (if already logged) - Shows today's score and notes with edit reminder

### Logging an Entry

1. Use the slider to select pain intensity (0-5 scale with 0.5 increments)
   - Green badge: 0-1 (None/Mild)
   - Blue badge: 1-2 (Mild)
   - Yellow badge: 2-3 (Moderate)
   - Orange badge: 3-4 (Severe)
   - Red badge: 4-5 (Very Severe/Extreme)
2. Optionally write notes about your headache (symptoms, triggers, etc.)
3. Click "Log Entry" to save
4. **Only one entry per day** - After logging today's entry, the form is disabled

### Managing Entries

1. Click "Manage Entries" button on the dashboard
2. View all your entries in a list
3. For each entry:
   - **Edit** - Click to modify the score or notes
   - **Delete** - Click to permanently remove the entry
4. Entry timestamps show full date and time

### Logout

- Click the "Logout" button in the top right
- Your session will be cleared
- You'll be redirected to the login page

## Technical Details

### Session Management

Sessions are managed **purely on the client side** using `sessionStorage`:

- The session persists while the tab is open
- Closing the tab automatically clears the session
- Each tab has its own independent session
- No session data is stored on the server or database

This is perfect for a personal health app where you want automatic logout for privacy and no server-side session tracking.

### Database Schema

```typescript
headacheEntries {
  score: number,      // 0-5 intensity scale (with 0.5 increments)
  notes: optional(string),  // User's optional notes
  createdAt: number,  // Unix timestamp in milliseconds
}
```

### API Functions

**Queries:**

- `listEntries()` - Get all entries (ordered newest first)
- `getTodayEntry()` - Check if there's an entry for today (used to block form)

**Mutations:**

- `addEntry(score, notes)` - Add a new entry
- `updateEntry(id, score, notes)` - Update an entry's score and notes
- `deleteEntry(id)` - Delete an entry

**Actions:**

- `verifyPassword(password)` - Verify password during login

## Customization

### Change Colors

Edit the Tailwind classes in `src/routes/index.tsx`:

- `from-purple-500 to-indigo-600` - Button gradient
- `from-blue-50 via-indigo-50 to-purple-50` - Background gradient

### Change Score Labels

Modify the `getScoreLabel()` function in `src/routes/index.tsx`

### Change Intensity Scale

Modify the range input `min="1" max="10"` to your preferred scale

## Building for Production

```bash
npm run build
```

This builds both the client and server bundles in the `dist/` directory.

## Environment Variables

Required:

- `HEADACHE_PASSWORD` - Your login password

Set via:

```bash
npx convex env set HEADACHE_PASSWORD "your-password"
```

## Troubleshooting

**"Password not configured" error:**

- Make sure you've set the `HEADACHE_PASSWORD` environment variable
- Run: `npx convex env set HEADACHE_PASSWORD "your-password"`

**Entries not showing:**

- Check browser console for errors
- Make sure you're logged in (session cookie set)
- Refresh the page

**Can't log in:**

- Verify you're entering the correct password
- Check that `HEADACHE_PASSWORD` is set correctly
- Clear browser cookies and try again

## File Structure

```
src/
  routes/
    index.tsx         # Main dashboard with chart and entry form
    login.tsx         # Login page
    entries.tsx       # Manage/edit entries page
    __root.tsx        # Root layout
  lib/
    auth.ts           # Client-side session management utilities
  styles/
    app.css           # Tailwind CSS

convex/
  schema.ts           # Database schema
  myFunctions.ts      # Queries and mutations for entries
  auth.ts             # Password verification action
```

## Future Enhancements

- Monthly/weekly statistics
- Export data as CSV
- Multiple password accounts
- Trigger and symptom tags
- Medication tracking
- Email notifications
- Dark mode toggle
