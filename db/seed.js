// get and destructure the client from index.js
// also import our functions from index.js
const { client, getAllUsers, createUser, updateUser, createPost, updatePost, getAllPosts, getPostsByUser, getUserById,  } = require('./index');

// we have to drop all the tables before we can rebuild the database
const dropTables = async() => {
    try {

        // cannot drop tables if they require a different table
        await client.query(`
        DROP TABLE IF EXISTS post_tags;
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
        `);

    } catch (error) {
        console.error('there was an error dropping tables: ', error);
        throw error;
    }
};

// we have to re-create all the tables before we test them
const createTables = async() => {
    try {

        await client.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL, 
            location VARCHAR(255) NOT NULL,
            active BOOLEAN DEFAULT true
        );
        CREATE TABLE posts (
            id SERIAL PRIMARY KEY,
            "authorId" INTEGER REFERENCES users(id) NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            active BOOLEAN DEFAULT true
        );
        CREATE TABLE tags (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL
        );
        CREATE TABLE post_tags (
            "postId" INTEGER REFERENCES posts(id),
            "tagId" INTEGER REFERENCES tags(id),
            UNIQUE ("postId", "tagId")
        );
        `);

    } catch (error) {
        console.log('there was an error creating tables');
        throw error;
    }
};

const createInitialUsers = async() => {
    try {
        
        const albert = await createUser({username: "albert", password: "notAlbert", name: "Alberto", location: "Hollywood"});

        const anthony = await createUser({ username: 'anTONY', password: 'hereLIEStony', name: 'Soprano', location: "Italy"});

        const sam = await createUser({username: 'SAMwhich', password: 'SAMeyeAM', name: 'samdra', location: 'OHIO'});

    } catch (error) {
        console.log('there was an error in createInitialUsers: ', error);
        throw error;
    }
};

const createInitialPosts = async() => {
    try {
        
        const [albert, anthony, sam] = await getAllUsers();

        await createPost({ authorId: albert.id, title: "FIRST TIME HAHA", content: "HAHAHAA YOU FOOLS, YOU FELL FOR MY TRAP"});

        await createPost({ authorId: anthony.id, title: "This reminds me", content: "There was this one time I tried to make a website and it went something like the Blues Brothers"});

        await createPost({ authorId: sam.id, title: "Hello :)", content: "Well this is super nice :) visit again soon."});

    } catch (error) {
        console.log('there was an error in createInitialPosts: ', error);
        throw error;
    }
};

// this function will rebuild our database by dropping and then creating all parts
const rebuildDb = async() => {
    try {
        // we have to reconnect to the client (postgres)
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialPosts();

    } catch (error) {
        console.log('there was an error rebuilding the database: ', error);
        throw error;
    }
};

const testDb = async() => {
    try {

    console.log("Starting to test database...");

    console.log("Calling getAllUsers");
    const users = await getAllUsers();
    console.log("Result:", users);

    console.log("Calling updateUser on users[0]");
    const updateUserResult = await updateUser(users[0].id, {
        name: "Richard Cheese",
        location: "Ransomware, ID",
    });
    console.log("Result:", updateUserResult);

    console.log("Calling getAllPosts");
    const posts = await getAllPosts();
    console.log("Result:", posts);

    console.log("Calling updatePost on posts[0]");
    const updatePostResult = await updatePost(posts[0].id, {
      title: "Same Title",
      content: "but this TIME YOU FELL FOR IT AGAIN HAHAHAA"
    });
    console.log("Result:", updatePostResult);

    console.log("Calling getUserById with 1");
    const albert = await getUserById(1);
    console.log("Result:", albert);

    console.log("Finished database tests!");

    } catch (error) {
        console.log('there was an error testing the database: ', error);
        throw error;
    }
};

// dont forget to client.end()
rebuildDb().then(testDb).catch(console.error).finally(() => client.end());