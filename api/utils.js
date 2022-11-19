const express = require('express');
const usersRouter = express.Router();

const requireUser = async (request, respond, next) => {
    if (!request.user) {
        next({
            name: "MissingUser",
            message: "You must be signed in to use this function."
        });
    }

    next();
}

module.exports = {
    requireUser,

}



