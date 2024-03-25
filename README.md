## Description

This application is a BACKEND PROJECT which provides users with a RESTful Community Creating API able to perform CRUD Operations and stores data using PostgreSQL Database with features such as user Authentication and Authorization.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run dev

```
## Features of the Application
- Each user, can create a community and (automatically) gets assigned the Community Admin role. They can add other users to the community who get assigned the Community Member role.
- Authentication
- User can signup and login using valid credentials.
- Community
- User can see all communities and create a new community.
- Moderation
- User can see all community members and add a user as member.
- User can remove a memberfrom community.

- 
## Flow of Application
- First you need to cd into the server directory and run "npm install" to install the node_modules.
- Secondly you need to integrate your database(PostgreSQL) with the application 
  create a .env and add your database credentials accordingly
- Run the following command line : "npm run dev" to get started with the application
- To test the API endpoints, open any API Tester application such as Postman or Thunder Client.
- Make sure that you login with a user and give its Authentication Bearer Token in the Token field.
- Test the APIs and you are all set to go.
