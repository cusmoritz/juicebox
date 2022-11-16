// get and destructure the client from index.js
// also import our functions from index.js
const { client, getAllUsers, createUsers } = require('./index');

// we have to drop all the tables before we can rebuild the database
const dropTables = async() => {
    try {

        // cannot drop tables if they require a different table
        await client.query(`
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
            password VARCHAR(255) NOT NULL
        );
        `);

    } catch (error) {
        console.log('there was an error creating tables');
        throw error;
    }
};

const createInitialUsers = async() => {
    try {
        
        const albert = await createUsers({username: 'albert', password: 'notAlbert'});
        const anthony = await createUsers({ username: 'anTONY', password: 'hereLIEStony'});
        const sam = await createUsers({username: 'SAMwhich', password: 'SAMeyeAM'});

        
    } catch (error) {
        console.log('there was an error in createInitialUsers: ', error);
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

    } catch (error) {
        console.log('there was an error rebuilding the database: ', error);
    }
};

const testDb = async() => {
    try {
        // connect to the client from index.js
        client.connect();

        const users = await getAllUsers();

        console.log(users);
    } catch (error) {
        console.log('there was an error testing the database: ', error)
    }
};

// dont forget to client.end()
rebuildDb().then(testDb).catch(console.error).finally(() => client.end());