const { Client } = require('pg'); // import pg moduelssss

// connect the database name a location for it
const client = new Client('postgress://localhost:5432/juicebox-dev');

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
        console.log('result in create user: ', result.rows)
        return result.rows;
    } catch (error) {
        throw error;
    }
}

// create a function that calls for all users and their id
const getAllUsers = async () => {
    const { rows } = await client.query(`
    SELECT id, username, name, location
    FROM users;
    `)
    return rows;
};

const updateUser = async (id, fields = {}) => {

    // if (Object.key(fields).length === 0) {
    //     return;
    // }

    // get the keys from all the fields under the id (id's are returned as objects)
        // map over the fields (ie name, username, password)
        // inside that object, get the key and index eg (name: albert)
        // rebuild the string with key=index+1 value
        // join them together wit a , and then a [space]
    const setString = Object.keys(fields).map(
        (key, index) => `"${ key }"=$${ index + 1}`
    ).join(', ');

    // return early if string is empty

    if (setString.length === 0) {
        return;
    }

    try {
        const result = await client.query(`
        UPDATE users
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
        `, Object.values(fields));

        return result.rows;
    } catch (error) {
        throw error;
    }
};


// create posts function
const createPost = async ({authorId, title, content}) => {
    console.log('we are creating a post');
    try {
        const result = await client.query(`
        INSERT INTO posts ("authorId", title, content)
        VALUES ($1, $2, $3)
        RETURNING *;
        `, [authorId, title, content])
        console.log('we are done creating a post: ', result)
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const updatePost = async(id, fields ={}) => {

    // title, content, active
    const setFields = Object.keys(fields).map(
        (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');

    try {
        const results = await client.query(`
            UPDATE posts 
            SET ${setFields}
            WHERE id=${ id }
            RETURNING *;
        `, Object.keys(fields));
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// const updateUser = async (id, fields = {}) => {
//     const setString = Object.keys(fields).map(
//         (key, index) => `"${ key }"=$${ index + 1}`
//     ).join(', ');

//     // return early if string is empty

//     if (setString.length === 0) {
//         return;
//     }

//     try {
//         const result = await client.query(`
//         UPDATE users
//         SET ${ setString }
//         WHERE id=${ id }
//         RETURNING *;
//         `, Object.values(fields));



//export our client as an object so we can easily add stuff later
module.exports = {
    client,
    getAllUsers,
    createUser,
    updateUser,
    createPost,
}