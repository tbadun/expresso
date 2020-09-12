const express = require('express');
// const sqlite3 = require('sqlite3');

const PORT = process.env.PORT || 4000;
// const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

app = express();

app.listen(PORT, () => {
    console.log(`Listening at ${PORT}...`)
})

module.exports = app;