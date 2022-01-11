
## To Run
- Clone repository
  - 'git@github.com:aventurino13/service-catalog.git'
- Run App
- ```run docker-compose up --build -V```

# Design Considerations

## Database
- Currently the database is dynamically generated and synchronized with TypeORM entities
- In the future I would like to create DB migrations which would generate the DB structure based on the migration files instead of synchronizing with any changes in the entities themselves. This way there is version control for the schemas 
    - When this is done I would have to update the TypeORM config syncronize setting to false

## Domains
- *Service* which contains multiple versions
    - Id (Auto generated column) 
      - After more consideration I would probably change this type to a UUID so that if we moved to a new database it wouldn't just be an incremented number and would be more unique
    - Name
    - Description
    - Created_Date
    - One to Many → Versions
    
- *Version* which is belongs to a service
    - Id (Auto generated column)
    - VersionNumber
    - isActive
        - Added this considering that there would be many versions for a given service and this would indicate which one is the current version. After more consideration I probably should have switched this to 'lastest' flag instead of active.
    - CreatedDate 
    - Many to One relation to service the version belongs to 

## Controllers 

- Post Service (  /service-catalog/service ) 
    - Params: CreateServiceDto
        - Name
        - Description
        - Version
    - Creates a new service and version based on inputs and returns the created service and version
    - Returns newly created service and version
- Curl:
```curl --location --request POST 'http://localhost:3000/service-catalog/service' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'name=<name>' \
--data-urlencode 'description=<description>' \
--data-urlencode 'version=<version as number>'```

- Post Version ( /service-catalog/version ) 
    - Params: CreateVersionDto
        - serviceId (Number)
        - version (Number)
    - Creates a new version with the given version name for service id that was passed in. 
    - Deactivates all other versions for service id so that there is only one active version for a given service. In the real world we would probably want to have more than one active version for backwards compatability but I wanted to add some business logic and play with the TYPE orm queries so I added this here. 
    - Returns a 404 if no service is found for given service id
    - Returns service with all versions including newly added version
  - Curl:
```curl --location --request POST 'http://localhost:3000/service-catalog/version' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'serviceId=<service id number>' \
--data-urlencode 'version=<new version number>'```


- Get Service by Id ( /service-catalog/id/[id] ) 
    - Search for specific service with it’s details including version
    - Returns 404 if service is not found
    - Right now I am using the primary key for identifying a service. Since I know it is not ideal to expose primary keys in the future I would update this to use a uniquely generated id to identify each service. 
  - Curl
  `curl --location --request GET 'http://localhost:3000/service-catalog/id/<serviceId>'`

- Get Service by Name ( /service-catalog/name/[name] ) 
    - Searches for services with name like search name param passed in
    - Returns all services and respective details which contain search param
    - Returns 404 if no services match param 
  - Curl
  `curl --location --request GET 'http://localhost:3000/service-catalog/name/<searchName>'`

- Get Recent Services ( /service-catalog/recent ) 
    - Gets all services ordered by service creation_date starting with most recent 
 - Curl
 `curl --location --request GET 'http://localhost:3000/service-catalog/recent'`

- Get Paginated Services ( /service-catalog/paginated )
    - Params:
        - Offset (Optional, number, must be greater than 0 ) 
        - Limit (Optional, number, must be greater than 1) 
    - Returns a set list of services with given length if given (limit) starting with the newest service based on the starting point if given(offset) 
    - Returns 404 if no services are found
    - Returns 400 if the search params are invalid
    - Curl
    ```curl --location --request GET 'http://localhost:3000/service-catalog/paginated?offset=<offsetValue>&limit=<limitValue>'```

- Get All Services ( /service-catalog )
    - Returns all services in the DB with their version details
    - Returns 404 if no services are found
    - In the future I would like to update this to only return the latest version of the service. This would mean I would switch the isActive flag to latest and then only return the service + latest version
  - Curl
  `curl --location --request GET 'http://localhost:3000/service-catalog'`

- Patch Service ( /service-catalog/service/:id )
    - Params: UpdateServiceDto
        - Name
        - Description
    - Updates the service with given id.
    - Returns 404 if no service is found for given id
    - Returns Updated Service
  - Curl
  ```curl --location --request PATCH 'http://localhost:3000/service-catalog/service/<serviceId>' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'name=<newName>' \
--data-urlencode 'description=<newDescription>'```



# TO DO
- I wanted the app to be easy to run so the DB credentials are in the env file - in the real world I would never check in the database credentials but for usability I did in this example 
- Add unit tests for all of the methods in the service
- Right now all the endpoints are returning Service entity Db objects. I would like to convert them to returning DTOs to the controller
- Right now all the search/filter functionality is separated out into different endpoints. I would like combine the search functionality into a single search with dynamic options - so you could search by multiple fields and sort the results as desired 
- I started looking into passport authorization - seems like this is a good tool for nest for providing some user/password as well as JWT authorization.

## Work Log
   - Created a new nest project 
    - Used npm for a package manager as this is what I have some experience with 
    - Verified I could start the app with ```npm run start:dev```
   - View app at http://localhost:3000 
   - Used nest generate to create the following
    - Controller
    - interface 
    - Service
   - Exporting the service from within the module make it so that any service that uses the module can also access the service
   - In order for the app to have access to the new module we must add it to the main app module 
   - @Param from nest allows us to access route params in our method 
   - @body → parses the http body (nest runs JSON.parse() ) to provide JSON object to controller

   - Next I want to setup connection to the DB. My current development workflow uses docker so I am going to dockerize the application and run the DB in docker so that I do not have to run the DB locally
    - Dockerizing - https://blog.logrocket.com/containerized-development-nestjs-docker/ 
        - Make sure npm install command is after we load package.json so that it only runs if these files change 
        - Because we added `- /usr/src/app/node_modules`  and anonymous volume - To make sure new npm packages are added to docker context you must run  
        - To run `docker-compose up --build -V`
            - -V removes anonymous volumes and adds them again
   - Installed TypeORM with pg
   - npm install --save dotenv to load form env vars 
   - Ran into some trouble getting the DB connection - 
    - tried a couple of different online tutorials used this example configuration with env vars 
        - https://jaketrent.com/post/configure-typeorm-inject-nestjs-config 
   - Spent a lot of time messing with the configuration - but it ended up being that my DB container wasn't starting at all. I had an issue with space in docker volumes so pruning and restarting allowed the connection to work 

   - Setting up the service and version entities 
    - Following this example - https://github.com/typeorm/typeorm/blob/master/docs/many-to-one-one-to-many-relations.md
        - To map the One To Many (service) and the many to one (version) entities 
        - This should give me a serviceId foreign key in versions table to tie all the versions to a specific service
  - Next started with the work of the service API 







