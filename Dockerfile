# Base image
FROM node:20-alpine

# Buat direktori kerja
WORKDIR /app

# Copy dependency file dulu (biar cache build lebih efisien)
COPY package*.json pnpm-lock.yaml* ./

# Enable pnpm
RUN npm install -g pnpm

# Install dependencies
# Install dependencies
RUN pnpm install --prod --frozen-lockfile --ignore-scripts


# Copy seluruh kode
COPY . .

# Expose port (optional)
EXPOSE 3000

# Default command (akan di-override di docker-compose)
CMD ["node", "src/app.js"]
