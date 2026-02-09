# Todo Web Application

A professional SaaS productivity web application built with Next.js 14, TypeScript, Tailwind CSS, and Tremor UI components.

## Features

- **Authentication System**: Complete login and registration flows
- **Dashboard**: Overview with metric cards and progress tracking
- **Task Management**: Advanced task list with drag-and-drop functionality
- **Calendar**: Full calendar with event management
- **Profile Management**: User profile and settings
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Dark/Light Mode**: Theme switching with system preference detection
- **Animations**: Subtle Framer Motion animations throughout

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Tremor (UI Components)
- Framer Motion (Animations)
- React Icons

## Project Structure

```
todo-web-app/
├── frontend/
│   ├── app/                 # Next.js app router pages
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # Dashboard and related pages
│   │   └── layout.tsx       # Root layout
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities and type definitions
│   ├── styles/              # Global styles
│   └── public/              # Static assets
```

## Responsive Design

The application follows a mobile-first approach with:
- Bottom navigation on mobile devices
- Sidebar navigation on desktop
- Adaptive layouts for all screen sizes
- Touch-friendly controls and adequate spacing

## Key UI Components

- Metric cards for displaying statistics
- Progress indicators for task completion
- Status badges for task states (Ongoing/Completed/Canceled)
- Card-based content organization
- Floating action button for "Add Task"
- Professional color palette with calm tones

## Installation

```bash
cd todo-web-app/frontend
npm install
npm run dev
```

The application will be available at http://localhost:3000