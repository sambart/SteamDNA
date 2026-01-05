# SteamDNA 🎮

Discover your gaming DNA by analyzing your Steam profile. SteamDNA collects your gaming data, analyzes your playing patterns, and provides insights into your unique gaming personality.

## Features

- 🔐 **Steam OAuth Integration** - Secure authentication with your Steam account
- 📊 **Data Collection** - Automatically collect and normalize your gaming data
- 🧬 **Profile Analysis** - Analyze your gaming behavior and preferences
- 📈 **Interactive Dashboard** - Visualize your gaming statistics with beautiful charts
- 🎯 **Gaming Persona** - Discover your unique gaming personality type

## Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for TypeScript and JavaScript
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management
- **Passport** - Authentication middleware

### Frontend
- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Composable charting library
- **TypeScript** - Type-safe development

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## Project Structure

```
steam-dna/
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── src/
│   │   │   ├── auth/     # Authentication module
│   │   │   ├── user/     # User management
│   │   │   ├── steam/    # Steam API integration
│   │   │   ├── analysis/ # Gaming analysis logic
│   │   │   ├── common/   # Shared utilities
│   │   │   └── database/ # Database entities
│   │   ├── Dockerfile
│   │   └── package.json
│   └── frontend/         # Next.js app
│       ├── src/
│       │   ├── app/      # Next.js pages
│       │   ├── components/ # React components
│       │   ├── lib/      # Utilities and API client
│       │   └── types/    # TypeScript types
│       ├── Dockerfile
│       └── package.json
├── docker-compose.yml
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose (optional, for containerized setup)
- Steam API Key ([Get one here](https://steamcommunity.com/dev/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd steam-dna
   ```

2. **Set up environment variables**
   ```bash
   # Backend
   cp apps/backend/.env.example apps/backend/.env
   # Edit apps/backend/.env and add your Steam API key and other credentials

   # Frontend
   cp apps/frontend/.env.example apps/frontend/.env
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

### Running with Docker (Recommended)

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
npm run docker:up

# View logs
npm run docker:logs

# Stop all services
npm run docker:down
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- API Documentation: http://localhost:4000/api/docs

### Running Locally

1. **Start PostgreSQL and Redis**
   ```bash
   docker-compose up postgres redis -d
   ```

2. **Run backend**
   ```bash
   npm run dev:backend
   ```

3. **Run frontend** (in a new terminal)
   ```bash
   npm run dev:frontend
   ```

Or run both simultaneously:
```bash
npm run dev
```

## Configuration

### Backend Environment Variables

Edit `apps/backend/.env`:

```env
# Steam API Configuration
STEAM_API_KEY=your_steam_api_key_here
STEAM_RETURN_URL=http://localhost:4000/api/auth/steam/callback
STEAM_REALM=http://localhost:4000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=steamdna
DB_PASSWORD=steamdna_password
DB_DATABASE=steamdna

# JWT Secret
JWT_SECRET=your_secure_secret_here
```

### Getting a Steam API Key

1. Go to https://steamcommunity.com/dev/apikey
2. Sign in with your Steam account
3. Enter your domain name (use `localhost` for development)
4. Copy the generated API key to your `.env` file

## API Documentation

Once the backend is running, visit http://localhost:4000/api/docs for interactive API documentation powered by Swagger.

### Key Endpoints

- `GET /api/auth/steam` - Initiate Steam OAuth
- `GET /api/auth/steam/callback` - Steam OAuth callback
- `GET /api/user/profile` - Get user profile
- `GET /api/steam/games/:steamId` - Get owned games
- `GET /api/analysis/summary/:userId` - Get gaming profile summary
- `GET /api/analysis/dashboard/:userId` - Get detailed dashboard data

## Development

### Available Scripts

```bash
# Run both frontend and backend
npm run dev

# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend

# Build all projects
npm run build

# Build backend only
npm run build:backend

# Build frontend only
npm run build:frontend

# Docker commands
npm run docker:up      # Start all services
npm run docker:down    # Stop all services
npm run docker:logs    # View logs
```

### Database Migrations

```bash
cd apps/backend

# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## Roadmap

- [ ] Implement comprehensive Steam data collection
- [ ] Build gaming behavior analysis algorithms
- [ ] Create detailed dashboard with Recharts
- [ ] Add gaming persona classification
- [ ] Implement data caching with Redis
- [ ] Add user preferences and settings
- [ ] Create shareable profile pages
- [ ] Add comparison features with friends
- [ ] Implement achievement tracking
- [ ] Add mobile responsive design

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Steam Web API for providing gaming data
- NestJS and Next.js communities for excellent frameworks
- All contributors and users of this project
