## Bank Licensing & Compliance API

A backend service for managing bank licensing and regulatory compliance processes.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment Variables

```bash
cp .env.example .env
```

Update the `.env` file with your local configuration (e.g., database credentials, ports, etc.).

## Database Setup

### 1. Create Database

Ensure a database exists with the name specified in your `.env`

```
DB_NAME=your_database_name
```

Alternatively, start a database container using Docker:

```bash
docker compose up db -d
```

### 2. Run Migrations

```bash
npm run migration:run
```

### 3. Seed the Database

```bash
npm run seed
```

## Running the Application

### Development

```bash
npm run start
```

### Watch Mode (Auto Reload)

```bash
npm run start:dev
```

### Production

```bash
npm run start:prod
```

## Testing

### Unit Tests

```bash
npm run test
```

### End-to-End Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```
