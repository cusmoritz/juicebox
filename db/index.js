// require Postgres
const { Client } = require("pg");
// give the database a name and location
const client = new Client('postgres://localhost:5432/juicebox-dev');

const getAllUsers = async() => {

    // destructure to only get the 'results' so to speak
    const { rows } = await client.query(`
    SELECT id, username, name, location, active
    FROM users;
    `);

    return rows;
};

// this function creates our users, which we will use in seed.js
const createUser = async({ username, password, name, location }) => {
    try {
        // create a username and password, with interpolation
        const { rows } = await client.query(`
        INSERT INTO users (username, password, name, location)
        VALUES ($1 ,$2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
        `, [username, password, name, location]);

        // in general we are looking for the 'rows' from the client return statement
        return rows;
    } catch (error) {
        console.log('there was an error at createUsers: ', error);
        throw error;
    }
};

const updateUser = async(id, fields = {}) => {
    
    // create the string that we will update
    const setString = Object.keys(fields).map(
        // this is like saying 'first key' = $1
        // which we will throw into the [array] after the client.query
        (key, index) => `"${ key }"=$${ index + 1}`
        ).join(', ');

    // if there is no update, return early
    if (setString.length === 0) {
        return;
    }

    try {
        // this is the confucting part
        // but we grab the whole setString (name, location, username...)
        // and make them = id from the user we are updating
        const { rows } = await client.query(`
        UPDATE users
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
        `, Object.values(fields));
        // the values are referenced from the setString (name value, location value...)

        return rows;
    } catch (error) {
        console.log('there was an error in updateUser: ', error);
        throw error;
    }
};

// create the post function, which we will export to seed.js
const createPost = async({ authorId, title, content}) => {

    try {
        const { rows } = await client.query(`
        INSERT INTO posts ("authorId", title, content)
        VALUES ($1 ,$2, $3)
        ON CONFLICT (title) DO NOTHING
        RETURNING *;
        `, [authorId, title, content]);

        return rows;
    } catch (error) {
        console.log('there was an error in createPost: ', error);
        throw error;
    }
};

// this should update our posts
const updatePost = async(id, fields={ title, content, active }) => {

    const setString = Object.keys(fields).map(
        // this is like saying 'first key' = $1
        // which we will throw into the [array] after the client.query
        (key, index) => `"${ key }"=$${ index + 1}`
        ).join(', ');

    try {

        const { rows } = await client.query(`
        UPDATE posts
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
        `, Object.values(fields));

        return rows;
        
    } catch (error) {
        console.log('there was an error in updatePost: ', error);
        throw error;
    }
};

//get all the posts
const getAllPosts = async() => {
    try {

        const { rows } = await client.query(`
        SELECT id, "authorId", title, content, active
        FROM posts;
        `);
    
        return rows;
    } catch (error) {
        console.log('there was an error in getAllPosts: ', error);
        throw error;
    }
};

// get the posts by the users database Id
const getPostsByUser = async(userId) => {
    try {
        
        const { rows } = await client.query(`
        SELECT * FROM posts
        WHERE "authorId"=${ userId };
        `);

        return rows;
    } catch (error) {
        console.log('there was an error in getPostsByUser: ', error);
        throw error;
    }
};

// get the user by their database Id
const getUserById = async(userId) => {
    try {
        
        // get user from database and detructure just the user
        const {rows: [ user ]} = await client.query(`
            SELECT * 
            FROM users
            WHERE id=${ userId };
        `);

        // if they exist...
        if (!user) {
            return null;
        } else {
            // get rid of their password, snag their posts and add to object
            delete user.password;
            const userposts = await getPostsByUser(user.id);
            user.posts = userposts;
        }

        return user;
    } catch (error) {
        console.log('there was an error in getUserById: ', error);
        throw error;
    }
};

// export our modules as an object, so we can get them later
// exporting to seed.js
module.exports = {
    client,
    getAllUsers,
    createUser,
    updateUser,
    createPost,
    updatePost,
    getAllPosts, 
    getPostsByUser, 
    getUserById,
}