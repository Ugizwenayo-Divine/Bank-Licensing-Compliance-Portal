## Bank Licensing & Compliance API

An application for managing bank licensing and regulatory compliance processes.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment Variables

```bash
cp .env.example .env
```

Update the `.env` file with your local configuration (e.g., API base URL, feature flags).

```
PORT=4000
VITE_API_BASE_URL=http://localhost:3000
```

## Running the Application

### Development

Start the development server:

```bash
npm run dev
```

The app will typically be available at:

```
http://localhost:4000
```

### Build for Production

Create an optimized production build:

```bash
npm run build
```

### Preview Production Build

Serve the production build locally:

```bash
npm run preview
```
