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
    // const encodedTag = encodeURIComponent(tagName);
    console.log('tag name in tagsrouter/GET ', tagName);

    try {
        const posts = await getPostsByTagName(tagName);
        console.log('posts in tagsRouter: ', posts);
        
        respond.send({posts: posts});
        
    } catch (error) {
        console.log('there was an error in tagsRouter/GET: ', error);
        next({
            name: "TagsGETError",
            message: "There was an error getting posts with tags."
        });
    }
});



module.exports = tagsRouter;