const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors({
    origin: '*'
}))

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','index.html'))
});

app.get('/songs/:filename', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'songs',`${req.params.filename}.pdf`))
});

app.get('/next', (req, res) => {
    io.emit('change', 'n');
    res.send(true);
});

app.get('/prev', (req, res) => {
    io.emit('change', 'p');
    res.send(true);
});

io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening :3000');
});
