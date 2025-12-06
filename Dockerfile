# Use official Node.js LTS image
FROM node:20

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json first for caching dependencies
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000

# Set environment variable (optional: default for demo)
ENV NODE_ENV=production

# Run the application
CMD ["node", "main.js"]

