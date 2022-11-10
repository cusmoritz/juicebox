const { Client } = require('pg'); // import pg moduelssss

// connect the database name a location for it
const client = new Client('postgress://localhost:5432/juicebox-dev');

// create a function that calls for all users and their id
const getAllUsers = async () => {
    const { rows } = await client.query(`
    SELECT id, username, name, location
    FROM users;
    `)
    return rows;
}

const updateUser = async (id, fields = {}) => {

    if (Object.key(fields).length === 0) {
        return;
    }

    // get the keys from all the fields under the id (id's are returned as objects)
        // map over the fields (ie name, username, password)
        // inside that object, get the key and index eg (name: albert)
        // rebuild the string with key=index+1 value
        // join them together wit a , and then a [space]
    const setString = Object.keys(fields).map(
        (key, index) => `"${ key }"=$${ index + 1}`
    ).join(', ');

    // return early if string is empty

    // if (setString.length === 0) {
    //     return;
    // }

    try {
        const result = await client.query(`
        UPDATE users
        SET ${ setString }
        WHERE id= ${ id }
        RETURNING *;
        `, Object.values(fields));

        return result;
    } catch (error) {
        throw error;
    }
}

// create new user function
const createUser = async({username, password, name, location}) => {
    try {
        // VALUES $1 and $2 go from SQL line to username and password values
        // thanks to Postgres pg npm package
        const result = await client.query(`
        INSERT INTO users (username, password, name, location) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
        `, [username, password, name, location]);
        console.log('result in create user: ', result)
        return result.rows;
    } catch (error) {
        throw error;
    }
}

//export our client as an object so we can easily add stuff later
module.exports = {
    client,
    getAllUsers,
    createUser,
    updateUser,
}