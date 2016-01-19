// obtain a JWT-enabled version of request
  var request = require('google-oauth-jwt').requestWithJWT();
  var _dir = process.cwd();
  var jwt = {
    // use the email address of the service account, as seen in the API console
    email: 'gdrive@ezcollaboration.iam.gserviceaccount.com',
    // use the PEM file we generated from the downloaded key
    keyFile: './api/ezCollaboration-0854eadb9aa2-decrypted.pem',
    // specify the scopes you wish to access - each application has different scopes
    scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.photos.readonly',
        
        
    ]
  }
  
  module.exports = function(){
    
  
    var _about  = function(options, cb){
   
        request({
            url: 'https://www.googleapis.com/drive/v3/about?fields=user',
            jwt:jwt
            }, function (err, res, body) {
                return cb(err, body);
            });    
    }

    var _getFiles  = function(options, cb){
   
        request({
            url: 'https://www.googleapis.com/drive/v3/files',
            jwt:jwt
            }, function (err, res, body) {
                return cb(err, body);
            });    
    }
    
    /**
     * drive.files.create
     *
     * @desc Creates a new file.
     *
     * @alias drive.files.create
     * @memberOf! drive(v3)
     *
     * @param  {object} params - Parameters for request
     * @param  {boolean=} params.ignoreDefaultVisibility - Whether to ignore the domain's default visibility settings for the created file. Domain administrators can choose to make all uploaded files visible to the domain by default; this parameter bypasses that behavior for the request. Permissions are still inherited from parent folders.
     * @param  {boolean=} params.keepRevisionForever - Whether to set the 'keepForever' field in the new head revision. This is only applicable to files with binary content in Drive.
     * @param  {string=} params.ocrLanguage - A language hint for OCR processing during image import (ISO 639-1 code).
     * @param  {boolean=} params.useContentAsIndexableText - Whether to use the uploaded content as indexable text.
     * @param  {object} params.resource - Media resource metadata
     * @param  {object} params.media - Media object
     * @param  {string} params.media.mimeType - Media mime-type
     * @param  {string|object} params.media.body - Media body contents
     * @param  {callback} callback - The callback that handles the response.
     * @return {object} Request object
     */
    var _uploadFile  = function(options, cb){
        
        request({
            url: 'https://www.googleapis.com/drive/v3/files',
            jwt:jwt
            }, function (err, res, body) {
                return cb(err, body);
            });    
    }
    
    return {
        getFiles : _getFiles,
        about : _about,
        upload:_uploadFile
    }
    
  };
  
  
  
