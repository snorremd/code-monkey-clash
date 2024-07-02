#################################################
# Image to serve as the base for the other images
FROM oven/bun:1 AS base
WORKDIR /app


############################################################
# Image to install dependencies to make use of layer caching
FROM base AS install

# Install dev dependencies
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

######################################################
# Image to build the client script and tailwind styles
FROM base as prerelease

COPY --from=install /temp/dev/node_modules node_modules
COPY . .

RUN bun build:client
RUN bun build:tailwind

#########################################################
# Final application image to run Code Monkey Clash server

FROM base AS release

ENV CMC_SERVER_PORT=3000
ENV CMC_STATE_FILE=/app/state/state.json

COPY . .
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/public/tailwind.css public/tailwind.css
COPY --from=prerelease /app/public/client.js public/client.js

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "src/index.tsx" ]
