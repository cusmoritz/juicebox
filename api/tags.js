const express = require('express');
const tagsRouter = express.Router();

const { getAllTags } = require('../db');

tagsRouter.get('/', async(request, response) => {
    const tags = await getAllTags();

    response.send({
        tags
    });

});

module.exports = tagsRouter;