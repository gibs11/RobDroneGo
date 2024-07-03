# Official node version from DockerHub
FROM node:18.18.0

# Set the working dir
WORKDIR /src

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install Python 3 and build-essential
RUN apt-get update && apt-get install -y python3 build-essential

# Install application dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port your app runs on
EXPOSE 4000

# Transpile TypeScript to JavaScript and then run the JavaScript file
CMD ["npm", "start"]