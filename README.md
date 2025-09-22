# RHI - Relationship Health & Insights Dashboard

Advanced client relationship management with real-time CRFES scoring powered by Supabase.

## Setup Instructions

### 1. Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the database to be ready
3. Go to Settings → API to get your project URL and anon key
4. Go to SQL Editor and run the contents of `schema.sql` to create the database tables

### 2. Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Update the environment variables with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the dashboard.

### 5. Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add your environment variables in Vercel's dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Database Schema

The application uses the following tables:

- **agents**: Store agent/user information
- **clients**: Store client data with CRFES scores
- **interactions**: Log all client interactions
- **checklist_items**: Track checklist completion per client

## Features

- ✅ Real-time CRFES scoring with automatic tier assignment
- ✅ Interactive checklist management with auto-sync
- ✅ Agent management with role-based access
- ✅ Interaction logging with sentiment analysis
- ✅ Dashboard analytics with coverage metrics
- ✅ Red client SLA monitoring (24h callback)
- ✅ NBA templates for Green clients
- ✅ Flexible plans for Amber clients
- ✅ Full CRUD operations with Supabase persistence

## Technology Stack

- **Frontend**: Next.js 14 (React)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Inline CSS with responsive design
- **Deployment**: Vercel
- **State Management**: React hooks with real-time updates

## API Functions

All database operations are handled through the `SupabaseAPI` class:

### Clients
- `getClients()` - Fetch all clients
- `createClient(data)` - Create new client
- `updateClient(id, data)` - Update client
- `deleteClient(id)` - Delete client

### Agents
- `getAgents()` - Fetch all agents
- `createAgent(data)` - Create new agent
- `updateAgent(id, data)` - Update agent
- `deleteAgent(id)` - Delete agent

### Interactions
- `createInteraction(data)` - Log new interaction
- `getInteractionsByClient(clientId)` - Get client interaction history

### Checklist
- `getChecklistByClient(clientId)` - Get client checklist
- `updateChecklistItem(clientId, item, done)` - Update checklist item
- `getChecklistCoverage()` - Get overall coverage analytics

## Troubleshooting

### Connection Issues
- Verify your Supabase URL and API key are correct
- Check that RLS policies are properly configured
- Ensure your Supabase project is not paused

### Data Not Persisting
- Confirm the database schema has been applied
- Check browser console for error messages
- Verify environment variables are loaded correctly

### Deployment Issues
- Ensure all environment variables are set in Vercel
- Check build logs for any missing dependencies
- Verify Supabase project is accessible from production
