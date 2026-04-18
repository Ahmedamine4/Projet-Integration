const express = require('express')
const app = express();

//test route , affichage apres le lancement
app.get("/",(req,res) => {
    res.send('<h1> Hello, API is running maintenant l! <h1>');
});
module.exports = app;  // export de l'app pour l'utilise dans sderver.js