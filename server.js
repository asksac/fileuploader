'use strict'; 

const https = require('https'), 
  fs = require('fs'), 
  path = require('path');

const express = require('express'), 
  morgan = require('morgan'), 
  winston = require('winston'),  
  formidable = require('formidable'); 

const UPLOAD_PATH = path.resolve(__dirname, './uploads'); 
const LISTEN_PORT = 8443; 

const app = express();

// ensure uploads directory exists
if (!fs.existsSync(UPLOAD_PATH)){
  fs.mkdirSync(UPLOAD_PATH);
}

/*
var bodyParser = require('body-parser'); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
*/

// setup mogan middleware loggers
app.use(morgan('dev', {
  skip: function (req, res) {
      return res.statusCode < 400
  }, stream: process.stderr
}));

app.use(morgan('dev', {
  skip: function (req, res) {
      return res.statusCode >= 400
  }, stream: process.stdout
}));


// setup winston logger for application logging
const logLevel = process.env.LOG_LEVEL || 'debug';
const logFormat = winston.format; 
const logger = winston.createLogger({
  level: logLevel,
  format: logFormat.combine(
    logFormat.colorize(), 
    //logFormat.simple(), 
    logFormat.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }), 
    logFormat.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [new winston.transports.Console()]
});

// curl -X GET 'http://localhost:3000/time'
app.post('/upload', (req, res) => {
  logger.debug('upload operation called'); 
  var form = new formidable.IncomingForm(); 
  form.uploadDir = UPLOAD_PATH; 
  form.maxFileSize = 200 * 1024 * 1024; // 200 mbs

  form.parse(req);

  form.on('fileBegin', function(name, file) { 
    // if form data had a filename, then set the name of saved file to match 
    // incoming filename
    if (file.name) file.path = path.resolve(form.uploadDir, file.name); 
    logger.info('File upload begining: ' + file.name + ' -> ' + file.path); 
  });

  form.on('file', function (name, file){
    logger.info('Uploaded file: ' + file.name + ' -> ' + file.path); 
  });

  form.on('end', function() {
    logger.info('All files finished uploading');
  });

  return res.status(200).send('Upload successful'); 
}); 

// setup static file server 
app.use('/', express.static(path.join(__dirname, 'public'))); 

// default 404 handler 
app.use(function (req, res, next) {
  res.status(404).send('We are sorry, that resource was not found!'); 
}); 

/*
// start http server 
var server = app.listen(8080, function () {
  logger.info('service running on port: ' + server.address().port); 
});
*/

// start https server
const httpsOptions = {
  key: fs.readFileSync(path.resolve(__dirname, 'key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, 'cert.pem')), 
  passphrase: 'best_password'
};

var server = https.createServer(httpsOptions, app).listen(LISTEN_PORT, () => {
  logger.info('service running on port: ' + server.address().port); 
});

// exporting is required for unit testing
module.exports = server; 