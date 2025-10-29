# Bicycle Supply Frontend

This is a React + Vite frontend for the Bicycle Supply application.

## Prerequisites
- Docker installed
- Node.js (for local development)

## Local Development
1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```
3. The app will run at `http://localhost:4028` by default.

## Building and Running with Docker

### 1. Build the Docker image
```sh
docker build -t bicycle-supply-frontend .
```

### 2. Run the Docker container
```sh
docker run -p 4028:4028 bicycle-supply-frontend
```

- The app will be available at `http://localhost:4028`.

## API Configuration
- Edit `src/config/api.js` to set your API base URL (local, Docker, or ngrok tunnel).

## Notes
- If your API is running in Docker, ensure ports are exposed and the API is accessible from the frontend.
- For CORS issues, update your backend to allow requests from your frontend's origin.

## Troubleshooting
- If you see CORS errors, check your backend CORS settings.
- If you see network errors, verify Docker container ports and API URL.
- For ngrok, ensure the tunnel is active and the URL matches your config.

## Build Artifacts
- Production build output is in the `dist/` folder.

---

For further help, contact the project maintainer.
