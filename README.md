# AGILE Tracker - Nasarawa State

The **AGILE (Adolescent Girls Initiative for Learning and Empowerment) Tracker** is a specialized digital monitoring and evaluation platform developed for Nasarawa State. It is designed to track, manage, and report on program activities across various components to ensure effective implementation and data-driven decision-making.

## Key Features

- **Activity Monitoring**: Real-time tracking of program activities across all components.
- **Monthly Reporting**: Streamlined submission process for component leads.
- **Admin Dashboard**: Comprehensive overview of project status, submissions, and component performance.
- **Role-Based Access**: Secure access for administrators and component members.
- **Document Management**: Secure storage and retrieval of monthly activity reports.

## Project Structure

- **Frontend**: Built with React, Vite, TypeScript, and shadcn/ui.
- **Backend/Database**: Powered by Supabase for real-time data and authentication.
- **Styling**: Tailwind CSS for a modern, responsive interface.
- **Animations**: Framer Motion for smooth transitions and interactive elements.

## Tech Stack

- **Framework**: [React](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Development

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Getting Started

1. **Clone the repository**:
   ```sh
   git clone https://github.com/OsamaAbdul/agile-tracker.git
   cd agiletracker
   ```

2. **Install dependencies**:
   ```sh
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**:
   ```sh
   npm run dev
   ```

## Deployment

The project is configured for deployment on **Vercel**. Simply push your changes to the repository or use the Vercel CLI to deploy.

---

© 2026 AGILE Nasarawa State. All rights reserved.
