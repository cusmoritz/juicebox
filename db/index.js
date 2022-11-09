const { Client } = require('pg'); // import pg moduelssss

// connect the database name a location for it
const client = new Client('postgress://localhost:5432/juicebox-dev');

//export our client as an object so we can easily add stuff later
module.exports = {
    client,
}