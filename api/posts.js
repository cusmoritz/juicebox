const express = require('express');
const postsRouter = express.Router();
const { requireUser } = require('./utils');

const { getAllPosts, createPost,  } = require('../db');

postsRouter.post('/', requireUser, async(request, respond, next) => {

    console.log('request body in postsRouter/post: ', request.user);
    // destructure our post to create
    const { title, content, tags } = request.body;

    // get the user id from the erquest so we can pass it into createPost
    const user = request.user.id;

    // get all the tags, split by spaces and trim spaces on the front and back
    const postTags = tags.trim().split(/\s+/);

    // this will be our object to use with createPost() later
    const postData = {};

    // if there are any tags, add them to the post object
    if (postTags.length) {
        postData.tags = postTags;
    };

    try {
        postData.title = title;
        postData.content = content;
        postData.authorId = user;
        const post = await createPost(postData);

        // if there is a post, send it back
        if (post) {
            respond.send({post});
        // otherwise, error handling
        } else {
            next({
                name: "ErrorCalling",
                message: "There was an error creating a new post."
            })
        };
        
    } catch (error) {
        console.log('there was an error in postRouter.post / : ', error);
        next({
            name: 'ErrorCreatingPost',
            message: 'There was an error creating a new post.'
        });
    }

});

postsRouter.get('/', requireUser, async(request, respond) => {
    const posts = await getAllPosts();

    respond.send({
        posts
    });

});

module.exports = postsRouter;

curl http://localhost:1337/api/posts -X POST -H 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2Njg4NzYzMjR9.Tiy9F-56I0f4MakOQeN3T_It_O_u7eWMTwUnqoLkvzE' -H 'Content-Type: application/json' -d