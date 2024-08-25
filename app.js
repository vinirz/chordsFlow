const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');

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

app.use(express.json());

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

app.post('/sync', async (req, res) => {
    const urls = req.body;
    console.log(urls);

    const updatedUrls = urls.map(url => {
        const urlParts = url.split('/');
        const lastPart = urlParts[urlParts.length - 1];
    
        if (lastPart.includes('.html')) {
            const newUrl = url.replace(lastPart, `${lastPart.replace('.html', '/imprimir.html#footerChords=false&tabs=false&')}`);
            return newUrl.replace('#instrument', 'instrument');
        } else {
            return url.replace('#', 'imprimir.html#footerChords=false&tabs=false&');
        }
    });

    if(fs.existsSync('./public/songs')) {
        fs.rmSync('./public/songs', { recursive: true });
    }
    
    fs.mkdirSync('./public/songs', { recursive: true });

    async function downloadPDF(url, filePath) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
    
        await page.goto(url, { waitUntil: 'networkidle2' });
    
        await page.pdf({
            path: filePath,
            format: 'A4',
            printBackground: true
        });
    
        await browser.close();
    }
    
    async function downloadMultiplePDFs(urls) {
        for (const [index, url] of urls.entries()) {
            const filePath = `./public/songs/${index + 1}.pdf`;
            await downloadPDF(url, filePath);
            console.log(`Downloaded: ${filePath}`);
        }
    }
    
    downloadMultiplePDFs(updatedUrls);
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
