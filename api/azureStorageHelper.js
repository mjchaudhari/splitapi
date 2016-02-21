    // obtain a JWT-enabled version of request
  var azure = require('azure-storage');
  var path = ure = require('path');
  var _dir = process.cwd();
  
  process.env.AZURE_STORAGE_ACCOUNT = "ezcollaborate";
  process.env.AZURE_STORAGE_ACCESS_KEY = "qYwtbk/eI8gd+gO5+IOzEKBAixXDXBTiUd5s6Ar7xYUdbscqDflsYh887Glw/BYv1FfWnHWv4Kr71NS1wqTtkA==";
  var azureBlobUrl = "https://ezcollaborate.blob.core.windows.net/gallary/";
  module.exports = function(){
    var blobService = azure.createBlobService();
    
    // blobService.createContainer('gallery', {timeoutIntervalInMs:5000, publicAccessLevel: 'blob'},function(error, result, response){
    //     if(error){
    //         Console.log("Container already exist.")
    //     }
    //     if(!error){
    //         Console.log("Container Created.")
    //     }
    // });
    
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
        if(options.container == null){
            options.container="";
        }
        if(options.container == ""){
           options.container = "gallery"; 
        }
        var containerName =options.container; 
        
        blobService.createContainerIfNotExists(containerName, {publicAccessLevel : 'blob'},function(err, result, response) {
            if (err) {
                console.log("Couldn't create container %s", containerName);
                console.error(err);
            } else {
                if (result) {
                    console.log('Container %s created', containerName);
                } else {
                    console.log('Container %s already exists', containerName);
                }

                // Your code goes here
            }
        });
        // blobService.createContainerIfNotExists(options.container)
        // .then(function(){
            
        // });
        
        //blobService.doesBlobExist(options.container,);
        // blobService.createContainerIfNotExists(options.container, {
                
        //     }, function(error, result, response) {
            // if(error){
            //     return cb(error);
            // }
            //if (!error) {
                var blobName = options.saveAs; 
                
                blobService.createBlockBlobFromLocalFile(options.container, blobName , options.filePath, function(error, result, response) {
                    if (!error) {
                        // file uploaded
                    }
                    var res = {
					    FileName :blobName,
                        url:azureBlobUrl + blobName
                    };
                    return cb(null, res);
                });        
        //     }
        // });
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
        uploadFile:_uploadFile,
        uploadStream : _uploadFileFromStream
    }
    
  };
  
  
  
