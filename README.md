# VMS-Frontend
A open source vessel monitoring system written in Angular.

## Setup for development
### Prerequisite
 - Docker
 - Docker-compose
 - Docker-sync

### Installation guide

Once all the prerequisite is installed, open the project folder with your terminal of choice (unless you're on windows, then you need to use Ubuntu for Windows).

Run the following commands:  
```
docker-sync start
cd docker
docker-compose --file docker-compose-init.yml up --build
cd ..
``` 

### Running the code

To run the project we need to start docker-sync again for this project if it's not already started using `docker-sync start` (if you just ran `docker-sync start` you don't need to do it again).

Run the following command in the project root:  
`docker-compose up --build`