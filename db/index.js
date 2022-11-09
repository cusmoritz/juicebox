const { Client } = require('pg'); // import pg moduelssss

// connect the database name a location for it
const client = new Client('postgress://localhost:5432/juicebox-dev');

// create a function that calls for all users and their id
const getAllUsers = async () => {
    const { rows } = await client.query(`
    SELECT id, username
    FROM users;
    `)
    return rows;
}

// create new user function
const createUser = async({username, password}) => {
    try {
        // VALUES $1 and $2 go from SQL line to username and password values
        // thanks to Postgres pg npm package
        const result = await client.query(`
        INSERT INTO users (username, password) 
        VALUES ($1, $2);
        `, [username, password]);
        return result;
    } catch (error) {
        throw error;
    }
}

//export our client as an object so we can easily add stuff later
module.exports = {
    client,
    getAllUsers,
    createUser,
}