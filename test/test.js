'use strict'; 

const request = require('request'),
    assert = require('assert'); 

const fs = require('fs'), 
  path = require('path'); 

const certFile = path.resolve(__dirname, '../cert.pem'); 

describe('File upload service', () => {
  var baseUrl = 'https://localhost:8443'; 
  var server; 
  var certBuf; 

  before('start server', () => {
    server = require('../server.js'); 
    certBuf = fs.readFileSync(certFile); 
  }); 

  after('close server', () => {
    server.close(); 
    fs.unlinkSync(path.resolve(__dirname, '../uploads/mocha_test_data.bin')); 
  }); 

  describe('GET /', () => {
    it('returns status code 200', function(done) {
      request.get({
        url: baseUrl + '/', 
        agentOptions: { ca: certBuf, rejectUnauthorized: false }
      }, (error, response, body) => {
        assert.equal(200, response.statusCode); 
        done();
      });
    });
  }); 

  describe('POST /upload', () => {
    //const sourceDataBuf = createSequentialBytesBuffer(); 
    const sourceDataBuf = createRandomBytesBuffer(); 

    it('uploads file and returns status code 200', (done) => {
      let multiPartFormData = {
        upload_file: {
          value: sourceDataBuf, // data to upload
          options: {
            filename: 'mocha_test_data.bin', 
            contentType: 'application/octet-stream'
          }  
        }
      }; 
      request.post({
        url: baseUrl + '/upload', 
        formData: multiPartFormData, 
        agentOptions: { ca: certBuf, rejectUnauthorized: false }
      }, (error, response, body) => {
        assert.equal(200, response.statusCode);
        done();
      }); 
    }); 

    it('compares data uploaded with file saved', (done) => {
      let targetDataBuf = fs.readFileSync(path.resolve(__dirname, '../uploads/mocha_test_data.bin')); 
      //sourceDataBuf.writeInt8(100, 0); // tamper the source data after upload

      assert.ok(sourceDataBuf.equals(targetDataBuf), 'Uploaded/target data does not match source data'); 
      done(); 
    }); 
  }); 
});

function createSequentialBytesBuffer(len = 500) {
  const buf = Buffer.allocUnsafe(len); 
  for (let i = 0; i < len; i++) {
    buf.writeUInt8(i % 256, i); 
  }
  return buf; 
}

function createRandomBytesBuffer(len = 500) {
  const buf = Buffer.allocUnsafe(len); 
  for (let i = 0; i < len; i++) {
    buf.writeUInt8(Math.floor(Math.random() * 256), i); 
  }
  return buf; 
}

function createFileFromBuffer(filename, buf) {
  if (!(filename instanceof String)) throw Error('Invalid type for filename parameter (must be String)'); 
  if (!(buf instanceof Buffer)) throw Error('Invalid type for buf parameter (must be Buffer)'); 

  // open file to write or overwrite
  let fd; 
  try {
    fd = fs.openSync(filename, 'w'); 
    fs.writeFileSync(fd, buf); 
    console.log('File \'' + fn + '\' written with data'); 
  } catch (err) {
    console.error('Error writing to file \'' + fn + '\''); 
    throw err; 
  } finally {
    if (fd !== undefined) fs.closeSync(fd); 
  }
}

function readFileToBuffer(filename) {
  if (!(filename instanceof String)) throw Error('Invalid type for filename parameter (must be String)'); 

  // open file to read
  let fd; 
  try {
    fd = fs.openSync(filename, 'r'); 
    let buf = fs.readFileSync(fd); // without encoding parameter, this will return a buffer 
    console.log('Done reading file \'' + fn + '\''); 
    return buf; 
  } catch (err) {
    console.error('Error reading file \'' + fn + '\''); 
    throw err; 
  } finally {
    if (fd !== undefined) fs.closeSync(fd); 
  }
}
