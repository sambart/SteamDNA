# SteamDNA 🎮

Discover your gaming DNA by analyzing your Steam profile. SteamDNA collects your gaming data, analyzes your playing patterns, and provides insights into your unique gaming personality.

## Features

- 🔍 **Steam ID Search** - Simply enter your Steam ID to get started
- 📊 **Data Collection** - Automatically fetch and analyze your Steam gaming data
- 🧬 **ML-Powered Analysis** - Machine learning-based gaming behavior analysis
- 📈 **Interactive Dashboard** - Visualize your gaming statistics with beautiful charts
- 🎯 **Gaming Persona** - AI-classified gaming personality (5 personas)
- 🤖 **Feature Extraction** - 16-dimensional feature vectors for deep insights

## Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for TypeScript and JavaScript
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management
- **Steam Web API** - Direct integration for data fetching

### ML Service
- **FastAPI** - High-performance Python API framework
- **scikit-learn** - Machine learning algorithms (K-means clustering)
- **pandas/numpy** - Data processing and feature engineering
- **SQLAlchemy** - Database ORM for Python

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
│   │   │   ├── steam/    # Steam API integration
│   │   │   ├── analysis/ # Basic analysis logic
│   │   │   ├── database/ # TypeORM entities
│   │   │   └── common/   # Shared utilities
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── ml-service/       # FastAPI ML Service
│   │   ├── app/
│   │   │   ├── models/   # SQLAlchemy models
│   │   │   ├── services/ # ML algorithms
│   │   │   ├── routers/  # API endpoints
│   │   │   └── schemas/  # Pydantic models
│   │   ├── Dockerfile
│   │   └── requirements.txt
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
   # Edit apps/backend/.env and add your Steam API key

   # Frontend
   cp apps/frontend/.env.example apps/frontend/.env

   # ML Service
   cp apps/ml-service/.env.example apps/ml-service/.env
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

### Running with Docker (Recommended)

```bash
# Start all services (PostgreSQL, Redis, Backend, ML Service, Frontend)
npm run docker:up

# View logs
npm run docker:logs

# Stop all services
npm run docker:down
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Backend API Docs: http://localhost:4000/api/docs
- ML Service API: http://localhost:5000
- ML Service Docs: http://localhost:5000/docs

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

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=steamdna
DB_PASSWORD=steamdna_password
DB_DATABASE=steamdna
```

### Getting a Steam API Key

1. Go to https://steamcommunity.com/dev/apikey
2. Sign in with your Steam account
3. Enter your domain name (use `localhost` for development)
4. Copy the generated API key to your `.env` file

## API Documentation

Once the backend is running, visit http://localhost:4000/api/docs for interactive API documentation powered by Swagger.

### Key Endpoints

All endpoints accept Steam ID64, vanity URL name, or profile URL as identifier:

- `GET /api/steam/user/:identifier` - Get complete Steam user data
- `GET /api/steam/games/:identifier` - Get owned games
- `GET /api/steam/player/:identifier` - Get player summary
- `GET /api/analysis/summary/:identifier` - Get gaming profile summary
- `GET /api/analysis/dashboard/:identifier` - Get detailed dashboard data

Examples:
- `/api/steam/user/76561197960287930` (Steam ID64)
- `/api/steam/user/gaben` (Vanity URL)
- `/api/steam/user/steamcommunity.com/id/gaben` (Profile URL)

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
