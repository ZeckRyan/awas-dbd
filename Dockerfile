FROM oven/bun:1 as builder
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install

COPY . .
RUN bun run build    # <-- WAJIB

# Production image
FROM oven/bun:1
WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000
CMD ["bun", "run", "start"]
