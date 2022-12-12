# Build Phase
# Base Image 
FROM node:16-alpine as builder

# Create working directory
WORKDIR /app

# Run some commands
COPY ./package.json .
RUN npm install
COPY . . 
RUN npm run build

# Run Phase
FROM nginx
EXPOSE 80
COPY --from=builder /app/build /usr/share/nginx/html
