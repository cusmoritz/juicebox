const PORT = 1337;
const express = require('express');
const server = express();
const morgan = require('morgan');
server.use(morgan('dev'));

server.use(express.json())

const { client } = require('./db');
client.connect();

server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});

const apiRouter = require('./api');
server.use('/api', apiRouter);