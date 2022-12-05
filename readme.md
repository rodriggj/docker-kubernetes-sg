# Section 7: Continous Integration and Deployment with AWS 

## Objectives
- [ ] Travis CI Setup 
- [ ] Travis YML File Configuration
- [ ] Automatic Build Creation
- [ ] Elastic Beanstalk Configuration
- [ ] Automated Deployments

## Travis CI Setup
1. Ensure you have a `Travis CI` account. Navigate [here](https://www.travis-ci.com/) to either setup or login to account. 

2. We need to setup a `travis.yml` file to instruct _Travis CI_ on how to execute our automated build/test suite. Specifically we need to tell _Travis CI_ the following: 
+ Tell _Travis CI_ we need a copy of docker running
+ Build our image using Dockerfile.dev
+ Tell _Travis CI_ how to run our test suite
+ Tell _Travis CI_ how to deploy our code to AWS

3. The first step in this process is to create the `travis.yml` file. To do this, in our root directory run the following: 
```s
cd ~/front-end
code .travis.yml
```

4. In the `.travis.yml` file insert the following config: 
```yaml
sudo: required
services: 
  - docker

before_install: 
  - docker build -t rodriggj/reactapp:v1 -f Dockerfile.dev .
```

5. A few additional params you need to add to the `.travis.yml` file include 1. the language param & 2. a script to be executed by travis to run our test scripts. 

```yaml
language: generic 
...
script:
  - docker run -e CI=true USERNAME/docker-react npm run test
```
The updated `.travis.yml` file should now look like the following: 

```yaml 
sudo: required
language: generic 

services: 
  - docker

before_install: 
  - docker build -t rodriggj/reactapp:v1 -f Dockerfile.dev .

script:
  - docker run -e CI=true rodriggj/reactapp:v1 npm run test -- --coverage
```

> REFERENCE: Readup on the `CI=true` variable [here](https://facebook.github.io/create-react-app/docs/running-tests#linux-macos-bash). You can also read the documentation for Docker Environment variables [here](https://docs.docker.com/engine/reference/run/#env-environment-variables)

6. Now that we've completed our `.travis.yml` file we need to execute the file with _Travis CI_; we will do this by committing our changes to github, where _Travis CI_ will recognize that a commit has been made and trigger the pipeline. 

```s
github add .
github commit -am 'adding travis.yml file'
git push -u origin master
```

> NOTE: You have to eliminate any nesting of folders. The .git command needs to be in the root directory or travis will not pick up on the commit. I flattened the entire directory structure removing the `front-end` parent dir to ensure that the `sect_07` branch will get read by travis. 

7. Upon pushing the changes to _Github_, _Travis CI_ recognizes the push via a webhook and begins the build process. 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205583564-c8c4a704-60ee-468b-b680-be2bbf4ab591.png"/>
</p>

And the console log within _Travis CI_ details that the tests passed, which is what we input to the `.travis.yml` file instructions. 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205583787-1aa03e01-392f-4e7b-b5fb-33b4b802fb5f.png"/>
</p>

## Incorporate AWS Host to our Pipeline

1. When creating our Elastic Beanstalk environment in the next lecture, we need to select Docker running on 64bit Amazon Linux 2 and make a few changes to our project:

As of Aug '21 the AWS platform will conflict with the project we have built since it will look for a `docker.compose.yml` file to build from by default instead of a `Dockerfile`.

To resolve this, please do the following:

1. Rename the development Compose config file

Rename the `docker-compose.yml` file to `docker-compose-dev.yml`. Going forward you will need to pass a flag to specify which compose file you want to build and run from:

```s
docker-compose -f docker-compose-dev.yml up
docker-compose -f docker-compose-dev.yml up --build
docker-compose -f docker-compose-dev.yml down
```

2. Create a production Compose config file

Create a `docker-compose.yml` file in the root of the project and paste the following:

```yaml
version: '3'
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '80:80'
```

AWS EBS will see a file named `docker-compose.yml` and use it to build the single container application.

3. Navigate to the `AWS Console`. And search for the `Elastic Beanstalk` service. Click `Create Web App`. Now we need to configure our app. 
+ Name: reactapp
+ Platform: Docker
+ Platform branch: Docker running on 64bit Amazon Linux 2
+ Platform version: 3.5.1 (Recommended)
+ Application code: sample application
+ Click `Create Application`

4. Elastich Beanstalk will take a while to build out the environment (~5 mins). When the build is successfully you will be redirected to a screen that looks like this: 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205662020-f3f26cc6-c88b-49b8-b71d-bd79ce5e85b4.png"/>
</p>

You can see in this image there is a URL that will route to the hosted application. In this case, the EBS service will display the default application for a Docker container b/c we choose the option `Sample application` in our config. 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205662449-ca21a174-d361-4d50-9c94-8b9c6fb11c15.png"/>
</p>

We obviously will modify this to add our own application, but for now it demonstrates that our config files for the Docker build process work. We will update the application later. 

Why do we use EBS at all for this step? Because EBS, among other things, will handle horizontal scaling for our application. You can conceptutually think of the EBS construct like this: 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205664595-4e6b9fba-d3c7-47dc-b26d-5991eca74a15.png"/>
</p>
