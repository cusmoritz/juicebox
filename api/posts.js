const express = require('express');
const postsRouter = express.Router();
const { requireUser } = require('./utils');

const { getAllPosts, createPost, updatePost, getPostById,  } = require('../db');
const { response } = require('express');

postsRouter.post('/', requireUser, async(request, respond, next) => {

    console.log('request body in postsRouter/post: ', request.user);
    try {
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


        postData.title = title;
        postData.content = content;
        postData.authorId = user;
        const post = await createPost(postData);

        // if there is a post, send it back
        if (post) {
            respond.send({post}).status(200);
        // otherwise, error handling
        } 
        // else {
        //     next({
        //         name: "ErrorCalling",
        //         message: "There was an error creating a new post."
        //     })
        // };
        
    } catch (error) {
        console.log('there was an error in postRouter.post / : ', error);
        next({
            name: 'ErrorCreatingPost',
            message: 'There was an error creating a new post.'
        });
    }

});

postsRouter.get('/', requireUser, async(request, respond, next) => {
    try {
        // get all the posts
        const allPosts = await getAllPosts();

        // filter the posts by active: true / false
        const posts = allPosts.filter(eachPost => {
            return eachPost.active || (request.user && eachPost.author.id === request.user.id);
        });
        respond.send({
            posts
        });
    } catch (error) {
        console.log('there was an error in postsRouter/GET: ', error);
        next({
            name: "CannotGetPostsError",
            message: "There was an error getting all posts in postsRouter/GET"
        })
    }


});

// require user makes sure we are logged in before we can edit a post
postsRouter.patch('/:postId', requireUser, async(request, respond, next) => {
    // get the postId from the url (params)
    const { postId } = request.params;

    // get the content that is sent to us from the body
    const { title, content, tags } = request.body;

    // empty object to put our updated data into and send to database
    const updateData = {};

    // if we are sent tags put them in the updated object
    if (tags && tags.length > 0) {
        updateData.tags = tags.trim().split(/\s+/);
    };

    // if we are updating a title, change that
    if (title) {
        updateData.title = title;
    };

    // same for content
    if (content) {
        updateData.content = content;
    };

    try {
        // get original post in database from the url params
        const originalPost = await getPostById(postId);

        // check to see if user is the author of a post
        if (originalPost.author.id === request.user.id) {

            // if they are, use updatePost to change the post in our database
            const updatedPost = await updatePost(postId, updateData);

            // and send it back
            respond.send({ post: updatedPost });
        } else {
            next({
                name: "UnauthorizedUserError",
                message: "You can only update the posts you have created."
            });
        }

    } catch (error) {
        console.log('there was an error in postsRouter/PATCH: ', error);
        next({
            name: "ErrorUpdating",
            message: "There was an error updating your post."
        });
    }
});

postsRouter.delete('/:postId', requireUser, async (request, respond, next) => {

    try {
         // get the post id from the params
    const { postId } = request.params;

    // get the post from the database
    const post = await getPostById(postId);

    // if the post exists, and the user is the owner of the post...
    if (post && post.author.id === request.user.id) {
        // ...update the post to inactive...
        const updatedPost = await updatePost(post.id, { active: false });

        // ...and send it back
        respond.send({ post: updatedPost });
    } else {
        // if there was a post but the user was not the owner
        next( post ? {
            name: 'UnauthorizedUserError',
            message: 'You can only delete your own posts.'
        // or if there was no post
        } : {
            name: 'NoPostError',
            message: 'That post does not exist.'
        });
    }

    } catch (error) {
        console.log('there was an error in postsRouter/DELETE: ', error);
        next({
            name: 'UnauthorizedDeleteError',
            message: 'There was an error trying to delete a post.'
        })
    }    
});



module.exports = postsRouter;

