// get our postgres client 
const { client, getAllUsers, createUser, updateUser, createPost, getPostsByUser, getUserById, getAllPosts, updatePost, createTags} = require('./index');

// get rid of the current table
const dropTables = async () => {
    try {
        // console.log('dropping tables');
        await client.query(`
        DROP TABLE IF EXISTS post_tags;
        DROP TABLE IF EXISTS tags;

        DROP TABLE IF EXISTS posts;

        DROP TABLE IF EXISTS users;

        `);
        // console.log('tables dropped');
    } catch (error) {
        console.log('error dropping tables');
        // throw instead of console.log so it goes back to the func that called it
        throw error;
    }
};

// create all tables in the db
const createTables = async () => {
    try {
        // console.log('starting to create tables');
        await client.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY, 
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            active BOOLEAN DEFAULT true
        );
        `);

        await client.query(`
        CREATE TABLE posts (
            id SERIAL PRIMARY KEY,
            "authorId" INTEGER REFERENCES users(id) NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            active BOOLEAN DEFAULT true
        );
        `);

        await client.query(`
        CREATE TABLE tags (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL
        );
        `);

        await client.query(`
        CREATE TABLE post_tags (
            "postId" INTEGER REFERENCES posts(id),
            "tagId" INTEGER REFERENCES tags(id),
            UNIQUE ("postId", "tagId")
        );
        `)

        // console.log('done creating user tables');
    } catch (error) {
        console.log('error creating tables', error);
        // again, throw in stead of console
        throw error;
    }
};

// create 1 user for us to make sure it works
const createInitialUser = async() => {
    try {
        // console.log('creating initial user');

        const albert = await createUser({username: "albert", password: "albert3times", name: "albert", location: "montreal"});
        const jones = await createUser({username: "jones67", password: "whatyoknow", name: "Gilmore", location: "vegas"});
        const sam = await createUser({username: "samDaMan", password: "justsam", name: "samuel", location: "N. Dakota"});

        // console.log('done creating initial users')
        return (albert, jones, sam);
    } catch (error) {
        throw error;
    }
};

// this will be our first test post
const createInitialPosts = async() => {
    // console.log('we are creating initial post');
    try {
        const [albert, jones, sam] = await getAllUsers();

        await createPost({
            authorId: albert.id,
            title: "initial post",
            content: "just setting up my tumblr"
        });
        await createPost({
            authorId: jones.id,
            title: "FIRST post",
            content: "hey is this thing on"
        });
        await createPost({
            authorId: sam.id,
            title: "POSTING FROM VACATION",
            content: "Hello there my name is Sam and I hope you like coming back to my website :)"
        });
        await createPost({
            authorId: albert.id,
            title: "second post coming in hot",
            content: "Does anyone else have strong opinions about onions?"
        });
        // console.log('we are done creating the initial posts');
        
    } catch (error) {
        console.log('there was a problem creating the initial post: ', error);
        throw error;
    }
};



// function that will delete tables, and then recreate them
const rebuildDB = async () => {
    try {
        // connect client from index.js
        client.connect();
        // console.log('rebuilding databaase');
        // drop the tables, create the tables after connection
        await dropTables();
        await createTables();
        await createInitialUser();
        await createInitialPosts();
        // await getUserById(2);
        // console.log('done rebuilding');

    } catch (error) {
        // here we console log beacuse we just call functions, not db directly
        console.log(error)
    } 
};

const testDB = async() => {
    try {

        console.log("Calling getAllUsers");
        const users = await getAllUsers();
        console.log("Result:", users);

        console.log("Calling updateUser on users[0]");
        const updateUserResult = await updateUser(users[0].id, {
            name: "updated users name",
            location: "updated location1"
        });
        console.log("Result:", updateUserResult);

        console.log("Calling getAllPosts");
        const posts = await getAllPosts();
        console.log("Result:", posts);

        console.log("Calling updatePost on posts[0]");
        const updatePostResult = await updatePost(posts[0].id, {
            title: "this title has been updated",
            content: "content updating is difficult"
          });
        console.log('result: ', updatePostResult)

        console.log('calling getUserById with 1');
        const albert = await getUserById(1);
        console.log('results: ', albert);

        const listofTags = ["great", "supergreat", "coolBeans"];
        await createTags(listofTags)

        return users;
    } catch (error) {
        console.error(error)
    }
};

rebuildDB().then(testDB).catch(console.error).finally(() => client.end());

// testDB();