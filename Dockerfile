FROM oven/bun as tailwind

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install

COPY src src
COPY tsconfig.json tailwind.config.js ./
COPY public public

RUN bun build:tailwind

FROM oven/bun as build

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install

COPY src src
COPY tsconfig.json ./
COPY public public

RUN bun run build:server

FROM oven/bun

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install --production

COPY --from=build /app/dist /app/dist
COPY --from=tailwind /app/public /app/public

ENV NODE_ENV production
CMD ["bun", "dist/index.js"]

EXPOSE 3000