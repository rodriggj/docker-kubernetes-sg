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

## Incorporate AWS Elastic Bean Stalk (EBS) into our Pipeline

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

## Deploy App to EBS via Travis

Now that we have Travis CI polling Github and creating a deployment each time we push a commit, we want to know configure Travis CI to push to EBS and deploy our application on AWS when tests pass. 

To do this we have changes to our `travis.yml` file to make. 

1. Opent hte `.travis.yml` file and add to the bottom of the script the following config:

```yaml
deploy: 
  provider: elasticbeanstalk
  region: "us-west-2"
  app: "reactapp"
  env: "Reactapp-env"
  bucket-name: "elasticbeanstalk-us-west-2-102305463663"
  bucket-path: "reactapp"
  on: 
    branch: master
```

2. The config to deploy the app is now captured in the .yaml file, but we will have to also pass keys to authenticate on our behalf. To do this we need to first create a new user. To do this navigate to the `IAM` service on the AWS Console. 

+ Click `Users`
+ Name: `reactapp-travis-ci`
+ Access Type: `programmatic access`
+ Click _Next_ to navigate to the Permissions
+ Click _Attach existing policies directly_
+ In the _Search Bar_ enter `beanstalk`
+ The search results will reveal multiple policies, select the one for `Full Access` to EBS
+ Click _Review_
+ Click _Create User_

> This process will now generate a Public and Secret Key. **These keys will only be presented 1x** so you must download the keys to a safe location or you will have to repeat this process and create new keys. 

3. The Secret Key provides access to your AWS profile which you do not want to make public. So you cannot add these public and secret keys to your .yaml file and push to github. Instead we want to make these secure by using them as environment variables managed by Travis CI. To do this 

+ On Travis CI Dashboard for your project click the _More Options_/_Settings_ on the UI. 
+ Scroll down on the UI till you see the section labeled _Environment Variables_
+ Name the Public and Secret Keys in the env var section and add to Travis CI. 

4. Now enter the _env vars_ in the .yaml file. 

```yaml
deploy: 
  provider: elasticbeanstalk
  region: "us-west-2"
  app: "reactapp"
  env: "Reactapp-env"
  bucket-name: "elasticbeanstalk-us-west-2-102305463663"
  bucket-path: "reactapp"
  on: 
    branch: master
  access_key_id: "$aws_access_key_id"
  secret_access_key: "$aws_secret_access_key"
```

5. Now the config is complete. We can now commit the code to the appropriate branch and merge with master. Becasue of our `on: branch: master` config, when we merge our commit with master Travis CI should init a build and push our reactapp to the Elastic Beanstalk Cluster. 

When you merge the commit to master you should see travis recognizing the build request and initiating the build 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/206937135-3cafe680-728a-4175-b32b-722d949e42db.png"/>
</p>

The Travis CI tooling will demonstrate logs back to the user and you will have to resolve any troubleshooting errors. If success full you will see a display similar to the following: 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/206937135-3cafe680-728a-4175-b32b-722d949e42db.png"/>
</p>

6. Even though the build completed. You don't have any access to the container. This is because we need to execute some port binding. In the docker file input the `EXPOSE` keyword and specify PORT 80. 

```s
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
```

> NOTE: The Expose Keyword is specfic to the fact that we are using ElasticBeanstalk. You don't need to do this if you are not using ElasticBeanstalk for your deployment. 

-------

## TEST