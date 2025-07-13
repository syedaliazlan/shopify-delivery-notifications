# Use lightweight Node.js base image
FROM node:18-alpine

# Install required native packages
RUN apk add --no-cache openssl bash libc6-compat

# Set the app's working directory
WORKDIR /app

# Set environment for production
ENV NODE_ENV=production

# Copy dependency files and install production packages
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm ci --omit=dev && npm cache clean --force

# Remove Shopify CLI (not needed in production)
RUN npm remove @shopify/cli

# Copy the rest of the app source code
COPY . .
COPY prisma ./prisma
COPY .env .  # Optional – include only if needed by Prisma or your app

# Build the app (Remix/Vite)
RUN npm run build

# Expose the port your app will listen on
EXPOSE 3000

# Run Prisma migrations and then start the server
CMD ["npm", "run", "docker-start"]
