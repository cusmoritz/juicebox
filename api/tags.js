const express = require('express');
const tagsRouter = express.Router();

const { getAllTags, getPostsByTagName } = require('../db');

// tagsRouter.get('/', async(request, response) => {
//     const tags = await getAllTags();

//     response.send({
//         tags
//     });

// });

tagsRouter.get('/:tagName/posts', async(request, respond, next) => {
    // grab the tagname from the url params
    const { tagName } = request.params;
    // console.log('this is the request: ', request.params.tagName)
    // const encodedTag = encodeURIComponent(tagName);
    console.log('tag name in tagsrouter/GET ', tagName);

    try {
        // get all the posts with that tag
        const allTagPosts = await getPostsByTagName(tagName);
        
        // filter them to make sure they are active
        const activePosts = allTagPosts.filter( eachPost => eachPost.active === true);
        
        // return active posts
        respond.send({posts: activePosts});
        
    } catch (error) {
        console.log('there was an error in tagsRouter/GET: ', error);
        next({
            name: "TagsGETError",
            message: "There was an error getting posts with tags."
        });
    }
});



module.exports = tagsRouter;