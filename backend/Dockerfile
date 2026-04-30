# Build 
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies 
COPY package*.json ./
RUN npm install

# Copy
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files and production dependencies
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
RUN npm install --omit=dev

# Expose the port
EXPOSE 5000

CMD ["node", "dist/server.js"]
