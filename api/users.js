const express = require('express');
const usersRouter = express.Router();
const { getAllUsers, getUserByUsername } = require('../db');

usersRouter.post('/login', async(request, respond, next) => {
    const { username, password } = request.body;
    
    // if there's no username or password
    if (!username || !password) {
        next({
            name: "MissingCredentials",
            message: "Must have a valid username and password"
        });
    }

    // if user exists, go get the user from the database
    try {
        console.log(username);
        // go get the user from the database before we check their credentials
        const user = await getUserByUsername(username);

        if (user && user.password == password) {
            // finally we create a token
            respond.send({ message: `you're now logged in as ${ username }`});
        } else {
            next({
                name: "IncorrectCredentials",
                message: "Username or password was incorrect."
            });
        }
    } catch (error) {
        console.log('there was an error in usersRoute.post: ', error);
        next(error);
    }
});

usersRouter.get('/', async(request, respond) => {

    const users = await getAllUsers();

    respond.send({
        users
    });

});



module.exports = usersRouter;