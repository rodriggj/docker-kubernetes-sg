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

8.