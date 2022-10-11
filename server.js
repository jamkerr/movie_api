const http = require('http'),
        url = require('url'),
        fs = require('fs');


http.createServer((request, response) => {
    let q = url.parse(request.url, true);

    // Logs request or error to log file.
    fs.appendFile('log.txt', 'URL: ' + request.url + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Added to log.');
        }
    });

    // Checks whether request pathnames includes the word 'documentation'. If it does, it returns the documentation page, otherwise it returns the home page.
    let filePath = '';
    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + '/documentation.html');
    } else {
        filePath = 'index.html';
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw err;
        }

        response.writeHead(200, { 'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    });
}).listen(8080);

console.log('My Node test server is running on port 8080.');