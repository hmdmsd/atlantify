# Atlantify

Atlantify is a low-tech music streaming application designed for students of IMT Atlantique. It aims to deliver a smooth and intuitive music streaming experience while respecting the storage and performance constraints of the Deuxfleurs infrastructure.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Build and Deployment](#build-and-deployment)
- [Key Components](#key-components)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Music Playback**: Enjoy seamless playback using an efficient audio player.
- **Radio System**: A shared radio queue where users can request songs.
- **Music Box**: A feature for suggesting songs to other users.
- **Low-Tech Constraints**: Designed to work under strict resource limits (2GB storage).
- **Authentication**: Secure login with JWT-based authentication.
- **Redux State Management**: Efficient state management for global application state.

## Tech Stack

- **Frontend Framework**: React
- **Styling**: Tailwind CSS
- **State Management**: Redux
- **Audio Processing**: Web Audio API
- **Storage**: Deuxfleurs S3-like static storage
- **Build Tool**: Vite

## Getting Started

Follow the steps below to get the project running locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- An S3-compatible storage setup (e.g., Deuxfleurs Garage)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/hmdmsd/atlantify.git
   cd atlantify
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your S3 credentials and other configuration settings.

### Environment Variables

The following environment variables need to be configured in the `.env` file:

| Variable         | Description                       |
| ---------------- | --------------------------------- |
| `S3_ACCESS_KEY`  | Access key for your S3 storage    |
| `S3_SECRET_KEY`  | Secret key for your S3 storage    |
| `S3_BUCKET_NAME` | Name of your S3 bucket            |
| `S3_ENDPOINT`    | Endpoint URL of your S3 storage   |
| `JWT_SECRET`     | Secret key for signing JWT tokens |

## Project Structure

```plaintext
atlantify/
├── node_modules/       # Project dependencies
├── public/             # Static assets
├── src/                # Application source code
│   ├── components/     # Reusable React components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Application pages
│   ├── routes/         # Route configuration
│   ├── services/       # API and utility services
│   ├── store/          # Redux store configuration
│   ├── styles/         # Tailwind CSS files
│   └── utils/          # Utility functions
├── .env                # Environment variables
├── package.json        # npm scripts and dependencies
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.js      # Vite build tool configuration
```

## Development Workflow

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000/`.

3. Make changes in the `src/` directory. The application will automatically reload.

### Running Tests

To run the unit and integration tests:

```bash
npm test
```

## Build and Deployment

To build the project for production:

```bash
npm run build
```

The production-ready files will be in the `dist/` directory. Upload these files to your S3-compatible storage:

```bash
aws s3 sync dist/ s3://your-bucket-name/ --delete --cache-control "public, max-age=31536000"
```

For automated deployments, configure the CI/CD pipeline as defined in `.github/workflows/deploy.yml`.

## Key Components

### Authentication

- JWT-based secure login.
- Stored in localStorage with session expiration handling.

### Audio Player

- Built using the Web Audio API for smooth playback.

### Radio System

- Queue-based song requests managed by all users.

### Music Box

- Allows users to suggest and vote for songs.

### Storage Management

- Efficiently handles files to stay within the 2GB storage limit.

### Cache System

- Multi-level caching using IndexedDB and browser cache for fast access.

## Contributing

We welcome contributions from the community! Follow these steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes with clear messages.
4. Submit a pull request.

Please ensure that your code follows the existing style and includes appropriate tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
