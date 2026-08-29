# ==============================================================================
# Qader Academy Backend - Production Dockerfile
# ==============================================================================
FROM node:20-alpine

# Install Chromium and required font dependencies for Puppeteer PDF certificate generation
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Run as non-root user for container security
RUN addgroup -S qadergroup && adduser -S qaderuser -G qadergroup \
    && chown -R qaderuser:qadergroup /app
USER qaderuser

EXPOSE 5000

CMD ["node", "server.js"]