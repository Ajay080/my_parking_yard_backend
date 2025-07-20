# Use Node.js LTS image
FROM node:20

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project
COPY . .

# Expose port your server uses (adjust if not 5000)
EXPOSE 5000

# Start your app
CMD ["npm", "start"]
