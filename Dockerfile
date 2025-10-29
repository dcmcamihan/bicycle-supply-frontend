# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Build the React app (if using Vite, use 'vite build')
RUN npm run build

# Install a simple static server to serve the build
RUN npm install -g serve

# Expose port 4028 (as set in vite.config.mjs)
EXPOSE 4028

# Start the app using 'serve' (adjust path if needed)
CMD ["serve", "-s", "build", "-l", "4028"]
