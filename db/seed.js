// get our postgres client 
const { client } = require('./index');

const testDB = async() => {
    try {
        // connect client from index.js
        client.connect();

        // talking to the db and getting all users
        const result = await client.query(`
        SELECT * FROM users;
        `);

        console.log(result);
    } catch (error) {
        console.error(error)
    } finally {
        // end the connection
        client.end();
    }
}

testDB();