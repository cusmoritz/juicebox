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
const createPost = async({ authorId, title, content, tags = []}) => {

    try {
        const { rows: [ post ] } = await client.query(`
        INSERT INTO posts ("authorId", title, content)
        VALUES ($1 ,$2, $3)
        RETURNING *;
        `, [authorId, title, content]);

        const tagList = await createTags(tags);

        return await addTagsToPost(post.id, tagList);
    } catch (error) {
        console.log('there was an error in createPost: ', error);
        throw error;
    }
};

// this should update our posts
const updatePost = async(postId, fields={}) => {

    // destructure to get our tags from the updated function
    const { tags } = fields;
    delete fields.tags;



    const setString = Object.keys(fields).map(
        // this is like saying 'first key' = $1
        // which we will throw into the [array] after the client.query
        (key, index) => `"${ key }"=$${ index + 1}`
        ).join(', ');

    try {

        if (setString.length > 0) {
            await client.query(`
            UPDATE posts
            SET ${setString}
            WHERE id=${ postId }
            RETURNING *;
            `, Object.values(fields));
        }

        if (tags === undefined) {
            return await getPostById(postId);
        };

        const tagList = await createTags(tags);

        const tagListIdString = tagList.map(
            tag => `${ tag.id }`
        ).join(', ');

        await client.query(`
        DELETE FROM post_tags
        WHERE "tagId"
        NOT IN (${ tagListIdString })
        AND "postId"=$1;
        `, [ postId ]);

        await addTagsToPost(postId, tagList);


        return await getPostById(postId);

        // const { rows: [ post ] } = await client.query(`
        // UPDATE posts
        // SET ${ setString }
        // WHERE id=${ id }
        // RETURNING *;
        // `, Object.values(fields));

    } catch (error) {
        console.log('there was an error in updatePost: ', error);
        throw error;
    }
};

//get all the posts
const getAllPosts = async() => {
    try {

        const { rows: postIds } = await client.query(`
        SELECT id
        FROM posts;
        `);

        const posts = await Promise.all(postIds.map(
            post => getPostById( post.id )
        ));
    
        return posts;
    } catch (error) {
        console.log('there was an error in getAllPosts: ', error);
        throw error;
    }
};

// get the posts by the users database Id
const getPostsByUser = async(userId) => {
    try {
        
        const { rows: postIds } = await client.query(`
        SELECT id 
        FROM posts
        WHERE "authorId"=${ userId };
        `);

        const posts = await Promise.all(postIds.map(
            post => getPostById(post.id)
        ));

        return posts;
    } catch (error) {
        console.log('there was an error in getPostsByUser: ', error);
        throw error;
    }
};

const getPostById = async(postId) => {
    try {
        const { rows: [ post ]} = await client.query(`
        SELECT * 
        FROM posts
        WHERE id=$1;
        `, [postId]);

        // console.log('post in getPostbyId: ', post);

        if (!post) {
            throw {
                name: "PostNotFoundError",
                message: "That post doesn't seem to exist."
            };
        };

        const { rows: tags } = await client.query(`
        SELECT tags.* 
        FROM tags
        JOIN post_tags ON tags.id=post_tags."tagId"
        WHERE post_tags."postId"=$1;
        `, [postId]);

        const { rows: [ author ]} = await client.query(`
        SELECT id, username, name, location
        FROM users
        WHERE id=$1;
        `, [post.authorId]);

        post.tags = tags;
        post.author = author;

        delete post.authorId;

        return post;
    } catch (error) {
        console.log('there was an error in getPostsById: ', error);
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
        };

        return user;
    } catch (error) {
        console.log('there was an error in getUserById: ', error);
        throw error;
    }
};

// get user by username
const getUserByUsername = async(username) => {
    try {
        const { rows: [ user ]} = await client.query(`
        SELECT * 
        FROM users
        WHERE username=$1;
        `, [username])

        return user;
    } catch (error) {
        console.log('there was an error in getUserByUsername: ', error);
        throw error;
    }
};

// THERE IS A COMMA IN HERE THAT SUCKS
async function createTags(tagList) {

    // console.log('tagList in createTags: ', tagList)
    if (tagList.length === 0) {
        return;
    }

    // creating our string for interpolation
    const insertValues = tagList.map(
        (_, index) => `$${ index + 1 }`).join('), (');
        // ends up as: ($1), ($2), ($3), ... depending on how many tags
        // console.log('insert values', insertValues);

    const selectValues = tagList.map(
        (_, index) => `$${ index + 1 }`).join(', ');
        // ends up as: $1, $2, $3 ... depending on how many tags
        // console.log('select values: ', selectValues);

    try {

        // put all the tags into our table
        await client.query(`
        INSERT INTO tags (name)
        VALUES (${ insertValues })
        ON CONFLICT (name) DO NOTHING;
        `, tagList);

        // get all the tags from the table that match our input tagList
        const { rows } = await client.query(`
        SELECT *
        FROM tags
        WHERE name IN (${ selectValues });
        `, tagList);

        // console.log('rows in createTags: ', rows);

        return rows;
        
    } catch (error) {
        console.log('there was an error in createTags: ', error);
        throw error;
    }
};

const createPostTag = async(postId, tagId) => {
    try {
        await client.query(`
        INSERT INTO post_tags("postId", "tagId")
        VALUES ($1, $2)
        ON CONFLICT ("postId", "tagId") DO NOTHING;
        `, [postId, tagId]);
    } catch (error) {
        console.log('there was an error in createPostTag: ', error);
        throw error;
    }
};

const addTagsToPost = async(postId, tagList) => {
    try {
        const createPostTagPromises = tagList.map(
            tag => createPostTag(postId, tag.id)
        );

        // we have to Promise all in case there's more than 1 tag
        await Promise.all(createPostTagPromises);

        return await getPostById(postId);
    } catch (error) {
        console.log('there was an error in addTagsToPost: ', error);
        throw error;
    }
};

const getPostsByTagName = async(tagName) => {
    try {
        // console.log('tag name', tagName)
        // get the post id
        const { rows: postIds } = await client.query(`
        SELECT posts.id
        FROM posts
        JOIN post_tags ON posts.id=post_tags."postId"
        JOIN tags ON tags.id=post_tags."tagId"
        WHERE tags.name=$1;
        `, [tagName]);

        // console.log("postIds in db index; ", postIds);

        return await Promise.all(postIds.map(
            post => getPostById(post.id)
        ));

    } catch (error) {
        console.log('there was an error in getPostsByTagName: ', error);
        throw error;
    }
};

const getAllTags = async() => {
    try {
        const { rows } = await client.query(`
        SELECT * 
        FROM tags;
        `);

        return rows;
    } catch (error) {
        console.log('there was an error in getAllTags: ', error);
        throw error;
    }
}

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
    createTags, 
    createPostTag,
    addTagsToPost,
    getPostById,
    getPostsByTagName,
    getAllTags,
    getUserByUsername,
}