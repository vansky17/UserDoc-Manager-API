# UserDoc-Manager-Client
This is a **Node.js/Express** server app with CRUD endpoints that retrieves data from a database. The associated front-end can be found here: [UserDoc-Manager-Client](https://github.com/vansky17/UserDoc-Manager-Client.git).

## Description



### Functional Description
This server application is the back-end of a small, yet not over-complicated content management system for small to mid-range organizations to help them manage their user/technical documentation. 

The app retrieves and stores the product and document properties in a **PostgreSQL** database. It also manages the storage of the files itself by sending a signed request back to the client to upload the file to an **AWS S3 Bucket**, and finally saves the storage path in the database.

### Technical Description
- SQL migration scripts are used to create the database with tables for products and documents including relationships and CASCADES
 
- A product is a parent record of child document(s).

- Docs and Products service objects are implemented for the corresponding tables.

- An AWS S3 service object is implemented to manage the /upload endpoint and send back a signed request.

- An Express server with routers handles the endpoints.


## Setup


1. Clone this repository

2. Change to the directory on your computer that contains this repo

3. Install dependencies: `npm install`
 
4. Create an S3 Bucket at [https://aws.amazon.com/en/console/](https://aws.amazon.com/en/console/) and set the access rights accordingly.
   
5. Configure Postgres and create the database user (as a superuser): `createuser -s userdoc-manager` 

6. Create the "development" and "test" PostgreSQL databases.

7. Prepare environment file: `cp example.env .env` and add the following values:
  - `PORT=8000`
  - `DATABASE_URL="postgresql://<user>n@localhost/<name of the database>"`
  - `TEST_DATABASE_URL="postgresql://<user>n@localhost/<name of the test database>"`
  -  `AWS_ACCESS_KEY = "<Your Key>"`
  - `AWS_SECRET_ACCESS_KEY = "<Your Secret Key>"`
  - `S3_BUCKET_NAME = "<name of your bucket>"`

8. Create development and test database tables:
   - `npm run migrate`
   - `npm run migrate:test`

9. Use `seed.docs.sql ` and `seed.products.sql` in the "seeds" folder to populate the tables. 
   
10. Run the server: `npm start`

