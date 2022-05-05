FROM node:16.14.2 as base

# Add package file
COPY package.json ./

# Updating npm version
RUN npm install -g npm@latest

# Install deps
RUN npm install

# Copy source
COPY src ./src
COPY tsconfig.json ./tsconfig.json

# Build dist
RUN npm run build

# Start production image build
FROM gcr.io/distroless/nodejs:16

# Copy node modules and build directory
COPY --from=base ./node_modules ./node_modules
COPY --from=base /public /public

# Expose port 3000
EXPOSE 3000
CMD ["public/index.js"]
