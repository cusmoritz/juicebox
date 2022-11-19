const express = require('express');
const usersRouter = express.Router();
const { getAllUsers, getUserByUsername, createUser } = require('../db');

// get token package
const jwt = require('jsonwebtoken');

usersRouter.post('/register', async (request, respond, next) => {
    
    // pull the user register information out of the request call
    const { username, password, name, location } = request.body;

    try {
        // check our user information against our database
        const _user = await getUserByUsername(username);

        // check if our username already exists. cant have dupes
        if (_user) {
            next({
                name: "UserDupliacted",
                message: "This user already exists. Try again"
            })
        } 

        // create a new user in the database
        const user = await createUser({username, password, name, location,});

        // create a token for the new user
        const token = jwt.sign({id: user.id, username: username}, process.env.JWT_SECRET);
        // if you wanted to add expiration, you would add
            // { expiresIn: '1w' }
        // after JWT_SECRET

        // after creation, send a nice message and the token 
        respond.send({
            message: `You have created a new account with username ${username}`,
            token
        });

    } catch (error) {
        console.log('there was an error in usersRouter.post /register: ', error);
        next({
            name: 'InvaledRegister',
            message: 'There was an error registering this user. Please try again.'
        })
    }
})


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

        // sign our jwt token to the user id and the username
        // we also need to use our secret, which is stored in the 'browser' in
        // process.env <-- file over there
        const token = jwt.sign({ id: user.id, username: username, }, process.env.JWT_SECRET)
        // console.log('token: ', token);

        if (user && user.password == password) {
            // finally we create a token
            respond.send({ message: `you're now logged in as ${ username }`, token: token});
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