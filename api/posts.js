const express = require('express');
const postsRouter = express.Router();

const { getAllPosts } = require('../db');

postsRouter.get('/', async(request, respond) => {
    const posts = await getAllPosts();

    respond.send({
        posts
    });

});

module.exports = postsRouter;