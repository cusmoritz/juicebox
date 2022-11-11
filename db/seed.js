// get our postgres client 
const { client, getAllUsers, createUser, updateUser, createPost} = require('./index');

// get rid of the current table
const dropTables = async () => {
    try {
        console.log('dropping tables');
        await client.query(`
        DROP TABLE IF EXISTS posts;
        `);
        await client.query(`
        DROP TABLE IF EXISTS users;
        `);
        console.log('tables dropped');
    } catch (error) {
        console.log('error dropping tables');
        // throw instead of console.log so it goes back to the func that called it
        throw error;
    }
};

// create all tables in the db
const createTables = async () => {
    try {
        console.log('starting to create tables');
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

        console.log('done creating user tables');
    } catch (error) {
        console.log('error creating tables');
        // again, throw in stead of console
        throw error;
    }
};

// create our posts tables
const createPostsTables = async () => {
    try {
        console.log('starting to create posts table');
        await client.query(`
        CREATE TABLE posts (
            id SERIAL PRIMARY KEY,
            "authorId" INTEGER REFERENCES users(id) NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            active BOOLEAN DEFAULT true
        );
        `); 
        console.log('done creating posts table');
    } catch (error) {
        console.log(error)
    }
};

// create 1 user for us to make sure it works
const createInitialUser = async() => {
    try {
        console.log('creating initial user');

        const albert = await createUser({username: "albert", password: "albert3times", name: "albert", location: "montreal"});
        const jones = await createUser({username: "jones67", password: "whatyoknow", name: "Gilmore", location: "vegas"});
        const sam = await createUser({username: "samDaMan", password: "justsam", name: "samuel", location: "N. Dakota"});

        console.log('done creating initial users')
        return (albert, jones, sam);
    } catch (error) {
        throw error;
    }
};

// function that will delete tables, and then recreate them
const rebuildDB = async () => {
    try {
        // connect client from index.js
        client.connect();
        console.log('rebuilding databaase');
        // drop the tables, create the tables after connection
        await dropTables();
        await createTables();
        await createPostsTables();
        await createInitialUser();
        console.log('done rebuilding');

    } catch (error) {
        // here we console log beacuse we just call functions, not db directly
        console.log(error)
    } 
    // finally {
    //     // end connection with the db
    //     client.end();
    // }
};

const testDB = async() => {
    try {

        // talking to the db and getting all users
        // const { rows } = await client.query(`
        // SELECT * FROM users;
        // `);

        const users = await getAllUsers();
        // console.log (users);
        // console.log(rows);
        console.log(users);

        console.log('here we are updating a user');
        const updateUserResult = await updateUser(users[0].id, {
            name: "updated users name",
            location: "updated location1"
        });
        console.log('updated results' , updateUserResult);

        console.log('update user function finished');

        return users;
    } catch (error) {
        console.error(error)
    }
};

rebuildDB().then(testDB).catch(console.error).finally(() => client.end());

// testDB();