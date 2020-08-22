const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
const listDir = require('./listDir');
const port = process.env.PORT || 8080;

http.createServer((req, res) => {
    let reqPath = url.parse(req.url, true);
    switch (reqPath.pathname) {
        case '/list_dir':
            if (!reqPath.query.path)
                reqPath.query.path = 'home';

            listDir(path.join(__dirname, '/', reqPath.query.path), (error, listOfFF) => {
                if (error) {
                    res.statusCode = error.code;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end(error.message);
                } else {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    const obj = {
                        currentPath: reqPath.query.path,
                        files: listOfFF
                    }
                    res.end(JSON.stringify(obj));
                }
            });
            break;
        case '/get_file':
            if (!reqPath.query.path)
                reqPath.query.path = 'home';
            serveFile(path.join(__dirname, reqPath.query.path), res);
            break;
        default:
            if (reqPath.pathname === '/') {
                reqPath.pathname = '/index.html';
            }
            serveFile(path.join('./public', reqPath.pathname), res);
            break;

    }
}).listen(port, () => {
    console.log('server started on port 8080');
    console.log(`open browser --> http://localhost:${port}/`);
});

// to serve file requests
const serveFile = (req, res) => {
    const ext = String(path.extname(req)).toLowerCase();

    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.txt': 'text/plain',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
    };
    //if  unknown then setting default type
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    fs.readFile(req, (err, content) => {
        if (err) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('404 error File not found');
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', contentType);
            res.end(content);
        }
    })
}