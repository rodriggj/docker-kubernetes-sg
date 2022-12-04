# Use an existing image as a base
FROM alpine

# Download and install dependencies
RUN apk add --update redis

# Tell the image what you want it todo when it starts
CMD ["redis-server"]