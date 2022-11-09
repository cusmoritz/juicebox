// get our postgres client 
const { client, getAllUsers, createUser} = require('./index');


// create 1 user for us to make sure it works
const createInitialUser = async() => {
    try {
        console.log('creating initial user');

        const albert = await createUser({username: "albert", password: "albert3times"})
        const jones = await createUser({username: "jones67", password: "whatyoknow"})
        const sam = await createUser({username: "samDaMan", password: "justsam"})

        console.log(albert);

        console.log('done creating albert')
        return (albert, jones, sam);
    } catch (error) {
        throw error;
    }
}

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
        return users;
    } catch (error) {
        console.error(error)
    } finally {
        // end the connection
        client.end();
    }
}

// create all tables in the db
const createTables = async () => {
    try {
        console.log('starting to create tables');
        await client.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY, 
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        );
        `)
        console.log('done creating tables');
    } catch (error) {
        console.log('error creating tables');
        // again, throw in stead of console
        throw error;
    }
}

// get rid of the current table
const dropTables = async () => {
    try {
        console.log('dropping tables');
        await client.query(`
        DROP TABLE IF EXISTS users;
        `)
        console.log('tables dropped');
    } catch (error) {
        console.log('error dropping tables');
        // throw instead of console.log so it goes back to the func that called it
        throw error;
    }
}

// function that will delete tables, and then recreate them
const rebuildDB = async () => {
    try {
        // connect client from index.js
        client.connect();
        console.log('rebuilding databaase');
        // drop the tables, create the tables after connection
        await dropTables();
        await createTables();
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
}

rebuildDB().then(testDB).catch(console.error).finally(() => client.end());

// testDB();