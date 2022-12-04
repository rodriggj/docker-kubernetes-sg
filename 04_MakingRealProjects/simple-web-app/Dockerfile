# Specify the base image
FROM node:14-alpine

# Specify a working directory
WORKDIR /usr/app

# Specifiy the commands you want to run 
COPY ./package.json ./
RUN npm install
COPY ./ ./

# Specify a Startup command you want to execute when the container starts
CMD ["npm", "start"]