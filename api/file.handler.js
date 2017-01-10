var path = require("path");
var fs = require('fs-extra'); 
var azureStorage = require("./azureStorageHelper.js")();
var gDrive = require("./googleDriveHelper.js")();
var shortid	= require("shortid");

var tmpUploadFolder = path.normalize(__dirname + "/../tmpStore");

exports.saveFileFromBase64 = function(fileName, b64String, callback){
    var matches = b64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};
  
  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }
  
  if(fileName == null || fileName == ""){
      fileName = shortid.generate();
  }
  
  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');
  var filePath = tmpUploadFolder + "/" + fileName;
  if(!filePath.endsWith(response.type)){
      filePath += "." + response.type.slice(-3);
  }
  fs.writeFile(filePath, response.data, function(err) {  
      if(err){
          callback(err);
          return;
      }
      callback(null, filePath);
  });
  
} 
/**
 * Upload given file to azure storage
 */
exports.uploadToAzureStorage = function(container, filePath, callback){
    
    var fileName = path.basename(filePath);
    // var options = {
    //     container:container,
    //     saveAs:fileName,
    //     name:fileName,
    //     fileName:fileName,
    //     fileStream : fstream
    // }
    // fstream.on('finish', function(fd) {
    //     //options.fileStream = fd;
            
    //     azureStorage.uploadFile (options, function(err,result){
    //         callback(err,result);
    //     });
    // });
    
    var options = {
        container:container,
        saveAs:fileName,
        filePath : filePath                
    }
    azureStorage.uploadFile(options, function(err,result){
        if(err){
            console.error(err);    
        }
        callback(err,result);
    });
}

exports.uploadToGoogleDrive = function(container,filePath, callback){
    var fileName = path.basename(filePath);
    var file;
    var options = {
        resource:file,
        media:{
            mimeType:"",
            body:null,
        }
        
    }
    gDrive.upload()
}