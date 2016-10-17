const http = require('http');
const fs = require('fs');
const path = require('path');

require('isomorphic-fetch');

const port = process.env.PORT || 8080;

http.createServer((request, response) => {

  if (request.url === '/tiles.json') {
    // Proxy osm2vectortiles to convert the URLs to https
    fetch('https://osm2vectortiles.tileserver.com/v2.json')
      .then(res => res.json())
      .then(res => {
        res.tiles = res.tiles.map(tileUrl => tileUrl.replace(/^http:/, 'https:'));
        res.grids = res.grids.map(gridUrl => gridUrl.replace(/^http:/, 'https:'));
        response.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Origin': '*',
        });
        response.end(JSON.stringify(res), 'utf-8');
      }).catch(_ => {
        fs.readFile('./500.html', (error500, content) => {
          response.writeHead(500, {'Content-Type': 'text/html'});
          response.end(content.replace('{{error}}', error500.message || error500.toString()), 'utf-8');
        });
      });
  } else if (request.url === '/') {
    fs.readFile('./index.html', (errorIndex, content) => {
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.end(content, 'utf-8');
    });
  } else {
    fs.readFile('./404.html', (error404, content) => {
      response.writeHead(404, {'Content-Type': 'text/html'});
      response.end(content, 'utf-8');
    });
  }

}).listen(port);

console.log(`listening on port ${port}`);
