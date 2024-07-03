#!/bin/bash

# Check if MongoDB URI is provided as an argument
if [ -z "$1" ]; then
  echo "Error: MongoDB URI not provided."
  exit 1
fi

# Check if PATH_API_HOST is provided as an argument
if [ -z "$2" ]; then
  echo "Error: PATH_API_HOST not provided."
  exit 1
fi

# Check if USER_MANAGEMENT_API_HOST is provided as an argument
if [ -z "$3"]; then
  echo "Error: USER_MANAGEMENT_API_HOST not provided."
  exit 1
fi

# Check if AUTH0_AUDIENCE is provided as an argument
if [ -z "$4"]; then
  echo "Error: AUTH0_AUDIENCE not provided."
  exit 1
fi

# Check if AUTH0_DOMAIN is provided as an argument
if [ -z "$5"]; then
  echo "Error: AUTH0_DOMAIN not provided."
  exit 1
fi

# Cd into the project directory
cd rdg-data-administration-module

# Update the code
git pull
echo "Git pull done"

# Install or update dependencies
npm install
echo "NPM install done"

# Set environment variables
export MONGODB_URI="$1"
export PATH_API_HOST="$2"
export USER_MANAGEMENT_API_HOST="$3"
export AUTH0_AUDIENCE="$4"
export AUTH0_DOMAIN="$5"
export PORT=80

# Restart the application
npm run pm2:delete
npm run pm2:start
echo "PM2 restart done"
