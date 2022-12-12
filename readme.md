# Section 8 - Building a Multi-container Application

> NOTE: The directory labeled sect_07 was merged with master and needs to have all the contents of the sect_07 directory promoted to the root directory if going to be run. The reason for this is the `sect_07` content was integrated with Elastic Bean Stalk and Travis CI where all the executable files needed to be at root directory level and not within a sub-directory. Now that this lesson is on Sect 8 with a new application, I am creating directory and placing the content in the folder so it doesn't conflict with the Sect 08 content. 

## Objective

The application we will be building is very simple but we are overcomplicating the architecture to include: 
- [ ] nginx server
- [ ] react & express servers
- [ ] redis 
- [ ] & postgres

This is purposely over complicated for the sake of demonstrating multiple containers working with each other. This archicture can absolutely be simplified, but again the point is to get an operational applciation and emphasize the use of mulitple containers interacting. 

The architecture will effectively be the following: 

### Development Flow

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/207156578-195c6977-f97e-40e0-9a2c-eeed0b9ac761.png">
</p>

1. The nginx server will serve as a "router" that will execute traffic routing either to the Front-End (React application) if the application is requesting an html or css file, but will route to the Express Server if just requesting data from our API.

2. Depending on the data that we are trying to retrieve from the backend (either a calculation, or simply a cache value) we will make an appropriate call to postgres or redis. 

The data flow will look something like this: 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/207158401-1a6f945e-5028-46f7-b96f-75d186277578.png">
</p>

## Steps

## References
