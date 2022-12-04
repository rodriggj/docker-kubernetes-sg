# Create a base image
FROM node:14-alpine

# Create a Working Directory
WORKDIR /usr/app

# Run a series of commands
COPY ./package.json ./
RUN npm install
COPY ./ ./

# Establish a startup command 
CMD ["npm", "start"]