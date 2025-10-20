# TimeTrackr ⏱️

<div align="center">
  <img src="assets/timetrackr-logo-full.svg" alt="TimeTrackr Logo">
</div>

A modern, local-first time tracking app built with Next.js, TypeScript, and a beautiful glass design system. Fast, private, and works entirely offline.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Try%20TimeTrackr-blue?style=for-the-badge&logo=vercel)](https://studio--studio-865518527-bc862.us-central1.hosted.app/)

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwind-css)
![Dexie.js](https://img.shields.io/badge/Dexie.js-4-FF6B6B?style=flat-square)

## ✨ Features

- **🕐 Real-time Timer**: Start/stop timer with live updates and project assignment
- **📊 Project Management**: Create and manage projects with color coding
- **📝 Time Entries**: Manual entry creation with beautiful custom form components
- **📈 Analytics**: Weekly reports with project breakdowns and time insights
- **✏️ Inline Editing**: Edit entries directly from the dashboard and reports
- **💾 Data Export**: Export all data as CSV for backup and analysis
- **🔒 Privacy-First**: All data stored locally in your browser
- **⚡ Offline-First**: Works completely offline, no internet required
- **🎨 Glass Design**: Beautiful glass morphism UI with consistent design system
- **📱 Responsive**: Optimized for desktop and mobile devices

## 🎨 Design System

TimeTrackr features a cohesive glass design system with:

- **Custom TimePicker**: Beautiful dropdown time selection with glass styling
- **Custom DatePicker**: Calendar picker with glass morphism design
- **ProjectSelector**: Glass dropdown with project color indicators
- **Consistent Components**: Unified design language across all interfaces
- **Smooth Animations**: Elegant transitions and hover effects
- **Professional UI**: Clean, modern interface optimized for productivity

## 🚀 Quick Start

**Want to try it first?** [Visit the live demo](https://studio--studio-865518527-bc862.us-central1.hosted.app/) to see TimeTrackr in action!

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/time-trackr.git
   cd time-trackr
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom glass design system
- **Database**: Dexie.js (IndexedDB wrapper)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **ID Generation**: uuid

## 📁 Project Structure

```
time-trackr/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Dashboard (main page)
│   ├── projects/          # Project management
│   ├── reports/           # Analytics and reports
│   └── settings/          # Settings and data management
├── components/            # React components
│   ├── TimerBar.tsx       # Floating timer bar
│   ├── EntryForm.tsx      # Manual entry form with custom components
│   ├── GroupedEntryList.tsx # Entry display and management
│   ├── TimePicker.tsx     # Custom time selection component
│   ├── DatePicker.tsx     # Custom calendar picker
│   ├── ProjectSelector.tsx # Glass project dropdown
│   ├── ReportTable.tsx    # Weekly analytics with inline editing
│   ├── CSVExportButton.tsx # Data export functionality
│   └── ThemeProvider.tsx  # Dark mode context
├── lib/                   # Core utilities and database
│   ├── db.ts             # Dexie schema and React hooks
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Utility functions
└── public/               # Static assets
```

## 🎯 Usage

### Starting a Timer
1. Click the **Start** button in the floating timer bar
2. Select a project (optional) and add a note
3. The timer will run in real-time and persist across page refreshes
4. Click **Stop** to save the time entry

### Managing Projects
1. Navigate to **Projects** from the dashboard
2. Click **New Project** to create a project
3. Choose a name and color for easy identification
4. Edit or delete projects as needed

### Manual Time Entries
1. Click **Add Manual Entry** on the dashboard
2. Use the beautiful custom form with TimePicker and DatePicker
3. Select project, start time, end time, and add notes
4. The duration is calculated automatically

### Viewing Reports
1. Go to **Reports** to see weekly analytics
2. Use the week selector to navigate between weeks
3. View daily breakdowns with project summaries
4. Edit entries inline with the same beautiful components
5. Export data as CSV for external analysis

### Editing Entries
1. Click the edit button on any entry in the dashboard or reports
2. Use the consistent form components for seamless editing
3. All changes are saved automatically to the local database

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Key Features Implementation

- **Timer Logic**: Custom `useTimer` hook with IndexedDB persistence
- **Data Layer**: Dexie.js with React hooks for reactive data
- **Theme System**: Context-based dark mode with localStorage
- **Export System**: Client-side CSV generation with Blob API
- **Design System**: Consistent glass morphism components
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with Docker

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database powered by [Dexie.js](https://dexie.org/)
- Icons by [Lucide](https://lucide.dev/)

---

**TimeTrackr** - Track your time with style. 🕐✨