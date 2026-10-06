# Steg 1: Bygg Next.js-appen
FROM node:22-alpine AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# Steg 2: Produktionsimage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1


COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

RUN npm ci --omit=dev

EXPOSE 3000

CMD ["npm", "run", "start", "--", "-H", "0.0.0.0"]