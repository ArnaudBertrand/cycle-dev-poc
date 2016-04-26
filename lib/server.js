const express = require('express');
const path = require('path');
const fs = require('fs');
const watchifyMiddleware = require('watchify-middleware');
const browserify = require('browserify');
const babelify = require('babelify');
const hotModuleReloading = require('browserify-hmr');
const bodyParser = require('body-parser');

exports.start = function (args) {
  // Make local copy of file, needed for editor import
  // This is slowing down between 0.5 to 1s I would say
  // This will not allow us to simple require all other files also
  if (!args[0]) {
    throw new Error('Missing entry point argument');
  }
  const filePath = path.join(process.cwd(), args[0]);


  // Create the app
  const app = express();
  app.use(bodyParser.json());

  // Serve index & style
  app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));
  app.get('/styles.css', (req, res) => res.sendFile(__dirname + '/styles.css'));


  // Generate application source code
  // Bundler
  const bundler = browserify(__dirname + '/editor.js', {
    cache: 'dynamic',
    transform: babelify,
    plugin: hotModuleReloading
  });
  // Middleware
  const middleware = watchifyMiddleware.emitter(bundler);
  // Serve bundle
  app.get('/bundle.js', middleware.middleware);
  // Copy and rebundle every time the original file change
  fs.watch(filePath, () => {
    fs.createReadStream(filePath).pipe(fs.createWriteStream(__dirname + '/app-copy.js'));

    // I believe this is the current bottleneck for time perf
    middleware.bundle();
  });


  // Sync files
  app.get('/code/app.js', function (req, res) {
    console.log('requested app.js');
    res.send(JSON.stringify({code: fs.readFileSync(filePath, 'utf-8')}));
  });
  app.put('/code/app.js', function (req, res) {
    fs.writeFileSync(filePath, req.body.code);
    res.sendStatus(200);
  });


  // Start server
  app.listen(3200, () => {
    console.log('App started on localhost:3200');
  });
};
