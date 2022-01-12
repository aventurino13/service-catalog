
## To Run
- Clone repository
  - `git clone git@github.com:aventurino13/service-catalog.git`
- Run App
  - `run docker-compose up --build -V`

## Quick Guide for Using API
Add three services 
```
curl --location --request POST 'http://localhost:3000/service-catalog/service' --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'name=service1' --data-urlencode 'description=description1' --data-urlencode 'version=1'
```

```
curl --location --request POST 'http://localhost:3000/service-catalog/service' --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'name=service2' --data-urlencode 'description=description2' --data-urlencode 'version=1'
```

```
curl --location --request POST 'http://localhost:3000/service-catalog/service' --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'name=Different Service Name' --data-urlencode 'description=description3' --data-urlencode 'version=1'
```

Get All Newly Created Services
```
curl --location --request GET 'http://localhost:3000/service-catalog'
```


Add a new version to existing service (use returned id from one of the calls above)
```
curl --location --request POST 'http://localhost:3000/service-catalog/version' --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'serviceId=<ServiceId>' --data-urlencode 'version=2'
```


Get a service by ID (use returned id from one of the calls above)
```
curl --location --request GET 'http://localhost:3000/service-catalog/id/<serviceId>'
```

Search for service by name (Should only return third service added above)
```
curl --location --request GET 'http://localhost:3000/service-catalog/name/Different'
```

Get services sorted by most recent
```
curl --location --request GET 'http://localhost:3000/service-catalog/recent'
```

Get only service2 using offset(1) and limit(1)
```
curl --location --request GET 'http://localhost:3000/service-catalog/paginated?offset=1&limit=1'
```

Update Existing Service (use returned id from one of the calls above)
```
curl --location --request PATCH 'http://localhost:3000/service-catalog/service/7' --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'name=New Name' --data-urlencode 'description=New Description'
```

# Design Considerations

## Database
- I wanted the app to be easy to run so the DB credentials are in the env file - in the real world I would never check in the database credentials but for usability I did in this example 
- Currently the database is dynamically generated and synchronized with TypeORM entities
- In the future I would like to create DB migrations which would generate the DB structure based on the migration files instead of synchronizing with any changes in the entities themselves. This way there is version control for the schemas 
    - When this is done I would have to update the TypeORM config syncronize setting to false

## Domains
- *Service* which contains multiple versions
    - Id (Auto generated column, Number) 
      - After more consideration I would probably change this type to a UUID so that if we moved to a new database it wouldn't just be an incremented number and would be more unique
    - Name (String)
    - Description (String)
    - Created_Date (Auto generated Date)
    - One to Many → Versions
    
- *Version* which is belongs to a service
    - Id (Auto generated column, number)
      - I would also consider updating this to a UUID instead of a number
    - VersionNumber (Number)
    - isActive (boolean)
        - Added this considering that there would be many versions for a given service and this would indicate which one is the current version. After more consideration I probably should have switched this to 'lastest' flag instead of active.
    - Created_Date (Auto generated Date)
    - Many to One → Service it belongs to

## Controllers 

- Post Service (  /service-catalog/service ) 
    - Params: CreateServiceDto
        - Name (string)
        - Description (String)
        - Version (Number)
    - Creates a new service and version based on inputs and returns the created service and version
    - Returns newly created service and version
`curl --location --request POST 'http://localhost:3000/service-catalog/service' --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'name=<name>' --data-urlencode 'description=<description>' --data-urlencode 'version=<version as number>'`

- Post Version ( /service-catalog/version ) 
    - Params: CreateVersionDto
        - serviceId (Number, Min 1)
        - version (Number, Min 1)
   - Creates a new version with the given version name for service id that was passed in. 
   - Returns service with all versions including newly added version
   - Returns a 404 if no service is found for given service id
   - ADDITIONAL LOGIC: Deactivates all other versions for service id so that there is only one active version for a given service. In the real world we would probably want to have more than one active version for backwards compatability but I wanted to add some business logic and play with the TYPE orm queries so I added this here. Also as mentioned about it would probably be good to switch this to a latest flag. 
`curl --location --request POST 'http://localhost:3000/service-catalog/version' --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'serviceId=<serviceId>' --data-urlencode 'version=<newVersionNumber>'`


- Get Service by Id ( /service-catalog/id/[id] ) 
  - Params: id: Service.id (Primary Key, number)
  - Returns a single servces with it’s details including version with serviceId from request
  - Returns 404 if service is not found
  - Right now I am using the primary key for identifying a service. I don't think it is ideal to expose simple icremented primary keys in the future I would update this to use a uniquely generated id to identify each service like a UUID. 
`curl --location --request GET 'http://localhost:3000/service-catalog/id/<serviceId>'`

- Get Service by Name ( /service-catalog/name/[name] ) 
  - Params: name: search(string)
  - Searches for services with name like search name param passed in
  - Returns all services and respective details which with name like name in search param
  - Returns 404 if no services match param 
`curl --location --request GET 'http://localhost:3000/service-catalog/name/<searchName>'`

- Get Recent Services ( /service-catalog/recent ) 
    - Gets all services ordered by service creation_date starting with most recent 
`curl --location --request GET 'http://localhost:3000/service-catalog/recent'`

- Get Paginated Services ( /service-catalog/paginated )
    - Params:
        - Offset (Optional, number, must be greater than 0 ) 
        - Limit (Optional, number, must be greater than 1) 
    - Returns a set list of services with given length if given (limit) starting with the newest service based on the starting point if given (offset) 
    - Returns 404 if no services are found
    - Returns 400 if the search params are invalid
 `curl --location --request GET 'http://localhost:3000/service-catalog/paginated?offset=<offsetValue>&limit=<limitValue>'`

- Get All Services ( /service-catalog )
    - Returns all services in the DB with their version details
    - Returns 404 if no services are found
    - In the future I would like to update this to only return the latest version of the service. This would mean I would switch the isActive flag to latest and then only return the service + latest version
`curl --location --request GET 'http://localhost:3000/service-catalog'`

- Patch Service ( /service-catalog/service/:id )
    - Params: UpdateServiceDto
        - Name
        - Description
    - Updates the service with given id.
    - Returns 404 if no service is found for given id
    - Returns Updated Service details 
`curl --location --request PATCH 'http://localhost:3000/service-catalog/service/<serviceId>' --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'name=<newName>' --data-urlencode 'description=<newDescription>'`



# Compromises / Future Goals
- Add unit tests for all of the methods in the service
  - I would want these tests to test the specific methods themselves
  - Ex the could test the validation of input values
- I would also like to add API tests - these would test the API end to end
  - Ex: Stage data in DB so that there is an existing service (I have used DB Unit in the past for Java) and have test that verifies you can update the existing service, add version etc. 
- Right now all the endpoints are returning Service entity Db objects. I would like to convert them to returning DTOs to the controller
- Right now all the search/filter functionality is separated out into different endpoints. I would like combine the search functionality into a single search with dynamic options - so you could search by multiple fields and sort the results as desired 
- I started looking into passport authorization - seems like this is a good tool for nest for providing some user/password as well as JWT authorization.
- It would also be nice to setup some logging. I think you can use middleware to setup logging for reach request and response.

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







