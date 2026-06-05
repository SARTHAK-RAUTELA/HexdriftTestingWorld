const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 8080;
const dir = __dirname;
http.createServer((req, res) => {
  const file = path.join(dir, req.url === '/' ? 'sea316-qa-report.html' : req.url);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200); res.end(data);
  });
}).listen(port, () => {
  console.log('Server running at http://localhost:' + port + '/sea316-qa-report.html');
});
