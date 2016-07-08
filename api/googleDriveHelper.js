var mime = require('mime');
var key = require('./ezCollaboration-d97a5741c83d.json');
var google = require('googleapis');
var drive = google.drive('v3');
var fs = require("fs");
var authClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    // Contents of private_key.pem if you want to load the pem file yourself
    // (do not use the path parameter above if using this param)
    // Scopes can be specified either as an array or as a single, space-delimited string
    ['https://www.googleapis.com/auth/drive'],
    // User to impersonate (leave empty if no impersonation needed)
    '');


  
  module.exports = function(){
    authClient.authorize(function(err, tokens) {
        if (err) {
            console.log(err);
            return;
        }
    });

    var _getFiles = function(params, callback){
        authClient.authorize(function(err, tokens) {
            if (err) {
                console.log(err);
                return;
            }
            var options = { auth: authClient };
            if(params !=null && params.parentId ){
                options.folderId = params.parentId
            }
            // Make an authorized request to list Drive files.
            drive.files.list(options, function(err, resp) {
                // handle err and response
                return callback(err,resp);
            });
        });
    }
    var _createFolder = function(folderName, description, parentFolderId, callback){
        var folderMetadata = {
            'auth': authClient ,
            'resource':{
                
                'name' : folderName,
                'mimeType' : 'application/vnd.google-apps.folder',
                "description" : description
            },
            'fields':"id"
        };
        if(parentFolderId){
            folderMetadata.parents = [ parentFolderId ];
        }
        authClient.authorize(function(err, tokens) {
            if (err) {
                console.log(err);
                return callback(err);
            }
            drive.files.create(folderMetadata, function(err, resp) {
                
                return callback(err,resp);
            });
        });
    }
    var _createFile = function(filePath, description, parentFolderId, callback){
        var baseName = fs.basename(filePath);
        var driveMime = _getGoogleMimeType(filePath);
        
        var folderMetadata = {
            'auth': authClient ,
            'resource':{
                "name" : baseName,
                "mimeType" : driveMime,
                "description" : description
            },
            "media": {
                "mimeType": driveMime,
                "body": fs.createReadStream(filePath) // read streams are awesome! 
            },
            'fields':"id"
        };

        if(parentFolderId){
            folderMetadata.parents = [ parentFolderId ];
        }
        
        authClient.authorize(function(err, tokens) {
            if (err) {
                console.log(err);
                return callback(err);
            }
            drive.files.create(folderMetadata, function(err, resp) {
                return callback(err,resp);
            });
        });
    }

    var _about  = function(options, cb){
   
        request({
            url: 'https://www.googleapis.com/drive/v3/about?fields=user',
            jwt:jwt
            }, function (err, res, body) {
                return cb(err, body);
            });    
    }

    
    
    var _getGoogleMimeType  = function(filePath){
        var mime = mime.lookup(filePath);
        var ext = mime.extension(mime);
        var retType = "";
        switch (mime) {
            case "xls": {
                retType = 'application/vnd.ms-excel'
                break;
            }
            case "xlsx": {
                retType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                break;
            }
            case "xml": {
                retType = 'text/xml'
                break;
            }
            case "ods": {
                retType = 'application/vnd.oasis.opendocument.spreadsheet'
                break;
            }
            case "csv": {
                retType = 'text/plain'
                break;
            }
            case "tmpl": {
                retType = 'text/plain'
                break;
            }
            case "pdf": {
                retType = 'application/pdf'
                break;
            }
            case "php": {
                retType = 'application/x-httpd-php'
                break;
            }
            case "jpg": {
                retType = 'image/jpeg'
                break;
            }
            case "png": {
                retType = 'image/png'
                break;
            }
            case "gif": {
                retType = 'image/gif'
                break;
            }
            case "bmp": {
                retType = 'image/bmp'
                break;
            }
            case "txt": {
                retType = 'text/plain'
                break;
            }
            case "doc": {
                retType = 'application/msword'
                break;
            }
            case "js": {
                retType = 'text/js'
                break;
            }
            case "swf": {
                retType = 'application/x-shockwave-flash'
                break;
            }
            case "mp3": {
                retType = 'audio/mpeg'
                break;
            }
            case "zip": {
                retType = 'application/zip'
                break;
            }
            case "rar": {
                retType = 'application/rar'
                break;
            }
            case "tar": {
                retType = 'application/tar'
                break;
            }
            case "arj": {
                retType = 'application/arj'
                break;
            }
            case "cab": {
                retType = 'application/cab'
                break;
            }
            case "html": {
                retType = 'text/html'
                break;
            }
            case "htm": {
                retType = 'text/html'
                break;
            }
            case "default": {
                retType = 'application/octet-stream'
                break;
            }
            case "folder": {
                retType = 'application/vnd.google-apps.folder'
                break;
            }

            default:
                retType = 'application/octet-stream'
                break;
        }
        
        return retType;
    }

    return {
        getFiles : _getFiles,
        createFolder : _createFolder, 
        createFile : _createFile,
    }
    
  };
  
  
  
