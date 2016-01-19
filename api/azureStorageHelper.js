// obtain a JWT-enabled version of request
  var azure = require('azure-storage');
  var path = ure = require('path');
  var _dir = process.cwd();
  
  process.env.AZURE_STORAGE_ACCOUNT = "ezcollaborate";
  process.env.AZURE_STORAGE_ACCESS_KEY = "Qkjcq8CdrL3cPtwHVZh1mPjJREKOWjBCrtEDh2flgHRJRWM6HHsrOc64NQz3cnJVUb3FvB0CQ3nYMaFjrhYREA==";
  var azureBlobUrl = "https://ezcollaborate.blob.core.windows.net/gallary/";
  module.exports = function(){
    var blobService = azure.createBlobService();
    
    var _getFiles  = function(options, cb){
   
        request({
            url: 'https://www.googleapis.com/drive/v3/files',
            jwt:jwt
            }, function (err, res, body) {
                return cb(err, body);
            });    
    }
    
    /**
     * Upload file in azure
     *
     * @desc Creates a new file.
     *
     * @alias azure.files.create
     * @memberOf! 
     *
     * @param  {object} params - Parameters for request
     * @param  {string=} params.cotainer - Name of existing folder 
     * @param  {string=} params.name - Whether to custom name for the file. Defaults to the name if the uploaded file
     * @param  {boolean=} params.overwrite - Overwrite if the file already exist
     
     * @param  {callback} callback - The callback that handles the response.
     * @return {object} Request object
     */
    var _uploadFile  = function(options, cb){
        blobService.createContainerIfNotExists('gallary', {
                publicAccessLevel: 'blob'
            }, function(error, result, response) {
            if (!error) {
                var blobName = options.saveAs; 
                
                blobService.createBlockBlobFromLocalFile(options.container, blobName , options.fileName, function(error, result, response) {
                    if (!error) {
                        // file uploaded
                    }
                    var res = {
					    FileName :blobName,
                        url:azureBlobUrl + blobName
                    };
                    return cb(null, res);
                });        
            }
        });
        
    }
    var _uploadFileFromStream  = function(options, cb){
        blobService.createContainerIfNotExists('gallary', {
                publicAccessLevel: 'blob'
            }, function(error, result, response) {
            if (!error) {
                var blobName = options.saveAs; 
                
                blobService.createBlockBlobFromStream(options.container, blobName , options.fileStream, function(error, result, response) {
                    if (!error) {
                        // file uploaded
                    }
                    var res = {
                        url:azureBlobUrl + blobName
                    };
                    return cb(null,res);
                });        
            }
        });
        
    }
    
    return {
        getFiles : _getFiles,
        uploadFile:_uploadFile,
        uploadStream : _uploadFileFromStream
    }
    
  };
  
  
  
