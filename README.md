# MLCC Dashboard - Maple Leaf Admin

A Next.js application serving as a community dashboard for MLCC (Maple Leaf Community Council) coordinators.

## Tech Stack

- **Next.js 15** with Pages Router architecture
- **Supabase** for backend database and authentication
- **Relume UI** components for UI elements
- **Tailwind CSS** with custom color palette
- **TypeScript** for type safety

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd maple-leaf-admin
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
maple-leaf-admin/
├── pages/              # Next.js pages (Pages Router)
├── components/         # React components
├── lib/               # Utility functions and Supabase client
├── styles/            # Global styles and Tailwind config
├── public/            # Static assets
└── .taskmaster/       # Task management files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Pages

- `/` - Home (redirects to `/people`)
- `/dashboard` - Membership metrics and revenue overview
- `/people` - Manage and view community members (neighbors)
- `/routes` - Manage delivery routes and route assignments
- `/businesses` - Manage business sponsors and members
- `/events` - Events management (coming soon)

## Development

This project uses:
- TypeScript for type safety
- Tailwind CSS for styling
- Relume UI components for consistent design
- Supabase for data persistence

## License

Private project for MLCC
