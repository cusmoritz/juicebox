// require Postgres
const { Client } = require("pg");
// give the database a name and location
const client = new Client('postgres://localhost:5432/juicebox-dev');

const getAllUsers = async() => {

    // destructure to only get the 'results' so to speak
    const { rows } = await client.query(`
    SELECT id, username
    FROM users;
    `);

    return rows;
};

// this function creates our users, which we will use in seed.js
const createUsers = async({ username, password }) => {
    try {
        // create a username and password, with interpolation
        const { rows } = await client.query(`
        INSERT INTO users (username, password)
        VALUES ($1 ,$2)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
        `, [username, password]);

        // in general we are looking for the 'rows' from the client return statement
        return rows;
    } catch (error) {
        console.log('there was an error at createUsers: ', error);
    }
}

// export our modules as an object, so we can get them later
// exporting to seed.js
module.exports = {
    client,
    getAllUsers,
    createUsers,

}