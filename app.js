const express = require('express');
const socket = require('socket.io');
const http = require('http');
const path = require('path');
const {Chess} = require("chess.js");
const { title } = require('process');

const app = express();

const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let players = {};
let currentPlayer = "W";


app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/",(req,res)=> {
    res.render("index",{title : "chessGame"});
});

io.on("connection", (socket)=>{
    console.log("New player connected");
    socket.on("churan recieved",()=>{
        io.emit("churan papadi");
    })
});
server.listen(3000, () => {
    console.log("Server is running on port 3000");
});