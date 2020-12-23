var path = require('path'), 
    eejs = require("ep_etherpad-lite/node/eejs");
    Busboy = require('busboy');
    StreamUpload = require('stream_upload');
    uuid = require('uuid');
    path = require('path');
    mimetypes = require('mime-db');
    url = require('url');
    settings = require('ep_etherpad-lite/node/utils/Settings');
    AWS = require('aws-sdk');
    mime = require('mime-types')
exports.eejsBlock_editbarMenuLeft = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_insert_media/templates/editbarButtons.ejs", {}, module);
  return cb();
}

exports.eejsBlock_body = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_insert_media/templates/modals.ejs", {}, module);
  return cb();
}

exports.eejsBlock_scripts = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_insert_media/templates/scripts.ejs", {}, module);
  return cb();
}

exports.eejsBlock_styles = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_insert_media/templates/styles.ejs", {}, module);
  return cb();
}

exports.expressConfigure = async function (hookName, context) {
  context.app.get('/p/getImage/:padId/:mediaId', function (req, res, next) {
    var s3  = new AWS.S3({
        accessKeyId: settings.ep_insert_media.storage.accessKeyId,
        secretAccessKey: settings.ep_insert_media.storage.secretAccessKey,
        endpoint: settings.ep_insert_media.storage.endPoint, 
        s3ForcePathStyle: true, // needed with minio?
        signatureVersion: 'v4'
    });
    try{
        var params = { Bucket: settings.ep_insert_media.storage.bucket, Key: `${req.params.padId}/${req.params.mediaId}`  };
        s3.getObject(params, function(err, data) {
            console.log("data going to be ", params ,data , err)
            if (data ){
                res.writeHead(200, {'Content-Type': 'image/jpeg'});
                res.write(data.Body, 'binary');
                res.end(null, 'binary');
            }else{
                res.write(err, 'binary');

                res.end(null, 'binary');
    
            }
            
        });
    }catch(error){
        console.log("error",error)
    }
    
  })
  context.app.get('/p/getVideo/:padId/:mediaId', function (req, res, next) {
    var s3  = new AWS.S3({
        accessKeyId: settings.ep_insert_media.storage.accessKeyId,
        secretAccessKey: settings.ep_insert_media.storage.secretAccessKey,
        endpoint: settings.ep_insert_media.storage.endPoint, 
        s3ForcePathStyle: true, // needed with minio?
        signatureVersion: 'v4'
    });
    try{
        var params = { Bucket: settings.ep_insert_media.storage.bucket, Key: `${req.params.padId}/${req.params.mediaId}`  };
        s3.getObject(params, function(err, data) {
            if (data){
                res.writeHead(200, {'Content-Type': 'video/mp4'});
                res.write(data.Body, 'binary');
                res.end(null, 'binary');
            }else{
                res.write(err, 'binary');

                res.end(null, 'binary');
            }
        });
    }catch(error){
        console.log("error",error)
    }

  })

 


  context.app.get('/p/getMedia/:padId/:mediaId', function (req, res, next) {
    var s3  = new AWS.S3({
        accessKeyId: settings.ep_insert_media.storage.accessKeyId,
        secretAccessKey: settings.ep_insert_media.storage.secretAccessKey,
        endpoint: settings.ep_insert_media.storage.endPoint, 
        s3ForcePathStyle: true, // needed with minio?
        signatureVersion: 'v4'
    });
    try{
        var params = { Bucket: settings.ep_insert_media.storage.bucket, Key: `${req.params.padId}/${req.params.mediaId}`  };
        s3.getObject(params, function(err, data) {
            if (data){
                res.writeHead(200, {'Content-Type': mime.lookup(req.params.mediaId)});
                res.write(data.Body, 'binary');
                res.end(null, 'binary');
            }else{
                res.write(err, 'binary');

                res.end(null, 'binary');
            }
        });
    }catch(error){
        console.log("error",error)
    }

  })

  context.app.post('/p/:padId/pluginfw/ep_insert_media/upload', function (req, res, next) {
    console.log(settings.ep_insert_media)
    var padId = req.params.padId;
    var storageConfig = settings.ep_insert_media.storage;
    var msgError = null;
    if (settings.ep_insert_media.storage.type =="s3"){
  
        var s3  = new AWS.S3({
            accessKeyId: settings.ep_insert_media.storage.accessKeyId,
            secretAccessKey: settings.ep_insert_media.storage.secretAccessKey,
            endpoint: settings.ep_insert_media.storage.endPoint, 
            s3ForcePathStyle: true, // needed with minio?
            signatureVersion: 'v4'
        });
 
    }else{
        var imageUpload = new StreamUpload({
            extensions: settings.ep_insert_media.fileTypes,
            maxSize: settings.ep_insert_media.maxFileSize,
            baseFolder: settings.ep_insert_media.storage.baseFolder,
            storage: settings.ep_insert_media.storage
          });
  
          
    }

    if (storageConfig) {
        try {
            var busboy = new Busboy({
                headers: req.headers,
                limits: {
                    fileSize: settings.ep_insert_media.maxFileSize
                }
            });
        } catch (error) {
            console.log('ep_insert_media ERROR', error);

            return next(error);
        }
        var isDone;
        var done = function (error) {
            if (error) {
                console.log('ep_insert_media UPLOAD ERROR', error);
                return;
            }
            if (isDone) return;
            isDone = true;
            req.unpipe(busboy);
            drainStream(req);
            busboy.removeAllListeners();
            msgError =error.stack.substring(0, error.stack.indexOf('\n'))

        };

        var uploadResult;
        var newFileName = uuid.v4();
        var accessPath = '';
        busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
            var fileType = path.extname(filename)

            var savedFilename = path.join(padId, newFileName + fileType);

            if (storageConfig && settings.ep_insert_media.storage.type === 'local') {
                var baseURL = settings.ep_insert_media.storage.baseURL;
                if (baseURL.charAt(baseURL.length - 1) !== '/') {
                    baseURL += '/';
                }
                accessPath = url.resolve(settings.ep_insert_media.storage.baseURL, savedFilename);
                savedFilename = path.join(settings.ep_insert_media.storage.baseFolder, savedFilename);
            }
            file.on('limit', function () {

                msgError = "File is too large"
            });
            file.on('error', function (error) {
                busboy.emit('error', error);
            });


            if (settings.ep_insert_media.storage.type =="s3"){
                var params_upload = {
                    bucket: settings.ep_insert_media.storage.bucket,
                    Bucket: settings.ep_insert_media.storage.bucket,
                    Key: savedFilename, // File name you want to save as in S3
                    Body: file
                };
                try{
                    s3.upload(params_upload, function(err, data) {
                        if (err)
                            console.log(err, err.stack,"error")
                        else   
                            console.log(data);
    
                        if (data){
                            return res.status(201).json({"type":settings.ep_insert_media.storage.type,"error":false,fileName :savedFilename ,fileType:fileType,data:data})
                        }else{
                            msgError=err.stack.substring(0, err.stack.indexOf('\n'))

                            
                        }
                        
                    });
                }catch(error){
                    msgError = error.message.substring(0, error.message.indexOf('\n'))
                    
                }

            }else{
                try {
                    uploadResult = imageUpload.upload(file, {type: mimetype, filename: savedFilename});
                    busboy.on('error', done);
                    busboy.on('finish', function () {
                    if (uploadResult) {
                        console.log("uploadResult",uploadResult)
                        uploadResult
                            .then(function (data) {
        
                                if (accessPath) {
                                    data = accessPath;
                                }
        
                                return res.status(201).json({"type":settings.ep_insert_media.storage.type,"error":false,fileName : data, fileType:fileType});
                            })
                            .catch(function (err) {
                                msgError = err.stack ;
                            });
                    }
        
                });
                }catch(error){
                    console.log(error)
                    msgError = error.message.substring(0, error.message.indexOf('\n'))
                    

                }
            
            }
           
            

        });

        if (msgError !=null)
            return res.status(201).json({"error":msgError});

        req.pipe(busboy);
    }












        
        

  })
}