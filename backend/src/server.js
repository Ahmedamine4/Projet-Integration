const app = require("./app"); // recupere l'app cree dans app.js
const pool = require("./config/db");

const PORT = process.env.PORT || 4001;  // s'il exist un port dans .env -> affectation , sinon port=4001

app.listen(PORT,() => {console.log(`app is up and running on port : ${PORT}`)
 console.log("SERVER STARTED ✔");
}); // listen c pour demarre le serveur , le console est juste pour verifier que ca marche

// test du DB
