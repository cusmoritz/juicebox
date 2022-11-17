const PORT = 1337;
const express = require('express');
const server = express();

server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});