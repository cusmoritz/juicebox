require('dotenv').config();

const express = require('express');
const apiRouter = express.Router();

// this stuff will allow us to create tokens
const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');
const { JWT_SECRET } = process.env;

apiRouter.use(async (request, response, next) => {
    const prefix = 'Bearer ';
    const auth = request.header('Authorization');

    if (!auth) {
        next();
    } else if (auth.startsWith(prefix)) {
        const token = auth.slice(prefix.length);

        try {
            const { id } = jwt.verify(token, JWT_SECRET);

            if (id) {
                request.user = await getUserById(id);
                next();
            }
        } catch ({ name, message}) {
            next({ name, message });
        }
    } else {
        next({
            name: 'AuthorizationHeaderError',
            message: `Authorization token must start with ${ prefix }`
        });
    }
});

// .use runs on every refresh / call
apiRouter.use((request, respond, next) => {

    // see if we have a user
    // this pretty much means that we have a user logged in 
    // because it runs on everything
    if (request.user) {
        console.log('user is here: ', request.user);
    }
    next();
})

const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);

const postsRouter = require('./posts');
apiRouter.use('/posts', postsRouter);

const tagsRouter = require('./tags');
const { request } = require('express');
apiRouter.use('/tags', tagsRouter)

apiRouter.use((error, request, response, next) => {
    response.send({
        name: error.name,
        message: error.message
    });
});

module.exports = apiRouter;