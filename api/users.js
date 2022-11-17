const express = require('express');
const usersRouter = express.Router();

// usersRouter.use((request, respond, next) => {
//     console.log('a request is being made to /users');

//     respond.send({ message: 'we in the /users' });

//     next();
// });

const { getAllUsers } = require('../db');

usersRouter.get('/', async(request, respond) => {

    const users = await getAllUsers();

    respond.send({
        users
    });

});

module.exports = usersRouter;