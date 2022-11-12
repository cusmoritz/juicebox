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
        // console.log('result in create user: ', result.rows)
        return result.rows;
    } catch (error) {
        throw error;
    }
}

// create a function that calls for all users and their id
const getAllUsers = async () => {
    try {
        const { rows } = await client.query(`
        SELECT id, username, name, location
        FROM users;
        `)
        return rows;
    } catch (error) {
        console.error('there was a problem getting all users', error);
    }
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
    // console.log('we are creating a post');
    try {
        const result = await client.query(`
        INSERT INTO posts ("authorId", title, content)
        VALUES ($1, $2, $3)
        RETURNING *;
        `, [authorId, title, content])
        // console.log('we are done creating a post: ', result)
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const updatePost = async(id, fields = {}) => {
    // console.log('trying to update posts ', fields)
    // title, content, active
    const setFields = Object.keys(fields).map(
        (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
        // console.log('we are updating a post: ', setFields);
    try {
        const results = await client.query(`
            UPDATE posts 
            SET ${ setFields }
            WHERE id=${ id }
            RETURNING *;
        `, Object.values(fields));
        // console.log('post updated: ', results)
        return results.rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// get all posts function
const getAllPosts = async () => {
    try {
        // title, content, active, posterId
        const { rows } = await client.query(`
        SELECT *
        FROM posts;
        `);
        return rows;
    } catch (error) {
        console.error('there was a problem getting all posts', error);
        throw error;
    }
};

// get posts by user
const getPostsByUser = async(userId) => {
    // console.log('userId in getPostsByUser ', userId)
    try {
        // console.log('getting posts from ', userId);
        const { rows } = await client.query(`
        SELECT * FROM posts
        WHERE "authorId"=${ userId };
        `);
        // console.log('done getting posts from ', userId);
        return rows;
    } catch (error) {
        console.error('there was a problem getting posts by user');
        throw error;
    }
};

// (username, password, name, location) 
const getUserById = async(userId) => {
    // console.log('we are getting a user by their id');
    try {
        const { rows } = await client.query(`
        SELECT *
        FROM users
        WHERE id=${ userId };
        `);
        // console.log('this should be our user objcet ', rows)
        const newUserObject = rows[0];

        // make sure there is a user before we return
        if (!newUserObject) {
            return null;
        } else {
            const userPosts = await getPostsByUser(newUserObject.id);
            newUserObject.posts = userPosts;
            delete newUserObject.password;
            // console.log('this is our user with their posts: ', newUserObject);
            return newUserObject;
        }
    } catch (error) {
        console.log('there was a problem getting the user');
        throw error;
    }
};

//export our client as an object so we can easily add stuff later
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