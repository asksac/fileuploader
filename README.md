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

## Launch Service
To launch the service, make sure the port (8443) is available, then run command: 
```
npm start
```

## Accessing Service from Web Browser
The service can be accessed from a web-browser. To start, open address: `https://localhost:8443/`
Then, drag and drop one or multiple files, and those files will be promptly uploaded to server, and 
saved in `uploads` directory. 

## Calling Service API
The service can also be accessed through its REST API interface. The following end-points are
availble: 

| Path | Description |
| --- | --- |
| GET / | Retrieve the index.html view page |
| POST /upload | Upload file(s) via multipart/form-data type request |

## Sample Client Code
Following sample code uses [Request](https://www.npmjs.com/package/request) to demonstrate 
how to call the file upload service via its API: 

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
    console.log('Response: ' + response.statusCode + '/' + body); 
  }
}); 
```

For more detailed use-cases, refer to [test.js](test/test.js) test suite written for mocha.js. 
