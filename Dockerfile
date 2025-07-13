FROM node:18-alpine

# Install dependencies needed for Prisma and other native modules
RUN apk add --no-cache openssl bash libc6-compat

# Expose the port your app listens on
EXPOSE 3000

# Set working directory inside the container
WORKDIR /app

# Set environment variable for production
ENV NODE_ENV=production

# Copy dependency files and install only production deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Remove Shopify CLI tools if not needed in production
RUN npm remove @shopify/cli

# Copy full project into container
COPY . .
COPY prisma ./prisma
COPY .env .  # if you use .env, otherwise you can remove this line

# Build the app (Remix/Vite)
RUN npm run build

# Final command to run Prisma setup and start server
CMD ["npm", "run", "docker-start"]
