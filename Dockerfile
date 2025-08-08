# Stage 1: Build the Vite application
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# This creates the /app/dist folder
RUN npm run build

# Stage 2: Serve the application from the 'dist' folder
FROM node:18-alpine

# Install the 'serve' package to act as a static server
RUN npm install -g serve

# Copy the built files from the 'build' stage
# Note: We are copying from /app/dist to a new 'dist' folder
COPY --from=build /app/dist ./dist

# Cloud Run will set this PORT variable automatically (e.g., 8080)
# We don't need to EXPOSE it here, as Cloud Run handles it.

# The 'serve' command automatically uses the PORT environment variable.
# We tell it to serve the 'dist' folder as a single-page app.
CMD ["serve", "-s", "dist"]