# 3.28 Building a Dockerfile

## Steps 
1. Write some psuedo code to guid us through the base image

```s
# 1. Specify a Base Image
# 2. Run some commands to install some addl programs
# 3. Specify a command to run at container startup
```

2. Create a file called `Dockerfile` and input the psuedo-code into this file
```s
touch Dockerfile 
```

`Dockerfile`
```s
# Use an existing image as a base
FROM alpine

# Download and install dependencies
RUN apk add --update redis

# Tell the image what you want it todo when it starts
CMD ["redis-server"]
```

3. Save the file, go to terminal, nav to the root dir of the `Dockerfile` and run
```s
docker build .
```

Should yield a console output like the following: 

With `Buildkit` enabled
<p align="center"> 
<img width="350" src="https://user-images.githubusercontent.com/8760590/205495638-1abc7d09-71a5-461e-bed9-0d046a5f24ec.png"/>
</p>

------

Without `Buildkit` enabled

<p align="center"> 
<img width="350" src="https://user-images.githubusercontent.com/8760590/205495882-1da96bc9-0885-4734-a9e1-c0c47e2ea766.png"/>
</p>

------

4. Now that the build has processed, we can run the docker image. Copy the image id from the console output. 

<p align="center"> 
<img width="350" src="https://user-images.githubusercontent.com/8760590/205496055-4edcfee3-2331-41bd-a74d-77d58d89219c.png"/>
</p>

And use it in the following command 
```s
docker run fc255cd7074a
```

Which should reveal the following console output

<p align="center"> 
<img width="350" src="https://user-images.githubusercontent.com/8760590/205496228-bad8076f-e7f6-4964-aea5-d50de4b2d331.png"/>
</p>

------

5. If we don't want to wait for an image id to be generated prior to refering to it for our image create process, we can instead name the image through a process called `tags`. To do this you follow a syntax as follows: 

```s
docker build -t <dockerLoginId>/<imageName>:<version> <pathToDockerFile>

#Example 
docker build -t rodriggj/myredis:latest .
```

Should produce the following output. Where you can see that now where we formerly had an image id, we now have a named image. 

<p align="center"> 
<img width="350" src="https://user-images.githubusercontent.com/8760590/205497397-59d25a79-61b6-4362-8763-39f03d50ff31.png"/>
</p>

------