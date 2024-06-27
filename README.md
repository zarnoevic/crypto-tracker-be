## Crypto Project Tracker Backend

This is the backend app for the Crypto Project Tracker. It is built with NestJS and uses MongoDB as a database. 
It also provides endpoints for user authentication and user preference management.

The corresponding frontend is [here](https://github.com/zarnoevic/crypto-tracker-fe).

## Installation

```bash
$ npm install
```

## Running the app

App requires 2 environment variables:
 - MONGO_URI (mongo connection string that includes database name, e.g. mongodb://localhost:27017/tracker)
 - MORALIS_API_KEY

you can create a .env file using the example one, and then fill your own Moralis API key

```bash
$ cp .env.example .env
```

To start database for development in Docker, following command can be used:

```bash
docker run -d -p 27017:27017 --name tracker_mongodb mongo # prefix with duo on linux if needed
```

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

