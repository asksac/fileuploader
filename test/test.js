'use strict'; 

const request = require('request'),
    assert = require('assert'); 

const fs = require('fs'), 
  path = require('path'), 
  os = require('os'); 

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
    //fs.unlinkSync(path.resolve(__dirname, '../uploads/mocha_test_data.bin')); 
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

  describe('Upload small data buffer using POST /upload', () => {
    //const sourceDataBuf = createSequentialBytesBuffer(); 
    const sourceDataBuf = createRandomBytesBuffer(1024); 

    it('uploads data buffer as file and returns status code 200', (done) => {
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

  describe('Upload large data file using POST /upload', () => {
    const sourceDataBuf = createSequentialBytesBuffer(1024 * 1024 *10); // 10mb data
    let tmpFileName = path.resolve(os.tmpDir(), 'mocha_test_large_data.bin'); 
    createFileFromBuffer(tmpFileName, sourceDataBuf); 

    it('uploads file as stream and returns status code 200', (done) => {
      let multiPartFormData = {
        upload_file: fs.createReadStream(tmpFileName)
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
      let targetDataBuf = fs.readFileSync(path.resolve(__dirname, '../uploads/mocha_test_large_data.bin')); 
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
  if (!(typeof filename == 'string' || filename instanceof String)) 
    throw Error('Invalid type for filename; expected string, received ' + typeof filename + '.'); 
  if (!(buf instanceof Buffer)) 
    throw Error('Invalid type for buf; (expected Buffer, received ' + typeof buf + '.'); 

  // open file to write or overwrite
  let fd; 
  try {
    fd = fs.openSync(filename, 'w'); 
    fs.writeFileSync(fd, buf); 
    console.log('File \'' + filename + '\' written with data'); 
  } catch (err) {
    console.error('Error writing to file \'' + filename + '\''); 
    throw err; 
  } finally {
    if (fd !== undefined) fs.closeSync(fd); 
  }
}

function readFileToBuffer(filename) {
  if (!(typeof filename == 'string' || filename instanceof String)) 
    throw Error('Invalid type for filename; expected string, received ' + typeof filename + '.'); 

  // open file to read
  let fd; 
  try {
    fd = fs.openSync(filename, 'r'); 
    let buf = fs.readFileSync(fd); // without encoding parameter, this will return a buffer 
    console.log('Done reading file \'' + filename + '\''); 
    return buf; 
  } catch (err) {
    console.error('Error reading file \'' + filename + '\''); 
    throw err; 
  } finally {
    if (fd !== undefined) fs.closeSync(fd); 
  }
}
