'use strict'; 

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