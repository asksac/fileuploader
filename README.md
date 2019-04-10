# HTTPS File Upload Service

This project contains a RESTful service to upload files via HTTPS. It uses Node.js and
utilizes the following key modules: 
- [Express.js](https://expressjs.com/)
- [Formidable](https://www.npmjs.com/package/formidable) 

## Installation
Run the following sequence of commands in a terminal from project directory: 
```
# installs npm packages based on package.json
npm install

# generates tls keys and certs
npm run-script gen-cert

# runs mocha test suite
npm test
```

## Launching Service
To launch the service, make sure the port (8443 by default) is available, then run `npm start` or
`node server.js`. 

## Configuring Startup Options
The service supports a few configurable options through `process.env`. For example, a custom 
listen port and upload directory can be specified by launching the service as follows: 
`PORT=3043 UPLOAD_PATH=/tmp node server.js` 

| Env Variable | Description | Default |
| --- | --- | --- |
| PORT | Sets listen port | 8443 |
| UPLOAD_PATH | Sets directory to save uploaded files to | ./uploads |
| MAX_FILE_SIZE | Sets maximum file size in bytes | 200 * 1024 * 1024 | 
| LOG_LEVEL | Sets logging level | info | 

## Accessing Service from Web Browser
The service can be accessed from a web-browser. To start, open address: `https://localhost:8443/`
Then, drag and drop one or multiple files, and those files will be promptly uploaded to server, and 
saved in `uploads` directory. 

## Calling Service using HTTP/S API
The service can also be accessed through its RESTful API interface. The following end-points are
availble: 

| Path | Description |
| --- | --- |
| GET / | Retrieve the index.html view page |
| POST /upload | Upload file(s) via multipart/form-data type request |

## Sample Client Code
Following [sample code](sample_client.js) uses [Request](https://www.npmjs.com/package/request)
module to demonstrate how to call the file upload service through HTTPS: 

```javascript
const fs = require('fs'), 
  request = require('request'); 

const baseUrl = 'https://localhost:8443'; 

let filename = 'file.data'; 

let multiPartFormData = {
  upload_file: fs.createReadStream(filename)
}; 

request.post({
  url: baseUrl + '/upload', 
  formData: multiPartFormData, 
  agentOptions: { rejectUnauthorized: false }
}, (error, response, body) => {
  if (error) { 
    console.error('Upload failed: ', error); 
  } else {
    console.log('Response: ' + response.statusCode + ' | ' + body); 
  }
}); 
```

For more detailed use-cases, refer to [test.js](test/test.js) test suite written for mocha.js. 
