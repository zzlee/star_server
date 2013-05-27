var userContentHandler = {};

var fs = require('fs');
var path = require('path');
var workingPath = process.env.AE_PROJECT;

/*
 * handle file upload
 */

//POST /miix/videos/user_content_files
userContentHandler.upload_photo_cb = function(req, res){

    var processFile = function( _userDataDir, _imageFileToProcess, _areaToCrop, _resizeTo, _osVersion, _callback1 ) {
        //var fileNameBody = _imageFileToProcess.substring(0, _imageFileToProcess.lastIndexOf(".") )
        var fileNameExt = _imageFileToProcess.substr( _imageFileToProcess.lastIndexOf('.')+1 );
        var fileToProcess = path.join( _userDataDir, _imageFileToProcess);
        var fileAutoOrinted = path.join( _userDataDir, "temp_auto_orient."+fileNameExt );
        var fileCropped = path.join( _userDataDir, "temp_cropped."+fileNameExt );
        var fileResized = path.join( _userDataDir, "_"+_imageFileToProcess );
        var imgWidth, imgHeight;
        
        var gm = require('gm');
        var cropAndResize = function( _fileToProcess, _callback2 ) {
        
            var resize = function() {
                gm( fileCropped )
                .resize(_resizeTo.width, _resizeTo.height)
                .write(fileResized, function (err) {
                    if (!err) {
                        logger.log('File cropping/resizing done');
                        fs.unlink(fileCropped);
                        if ( _callback2 )
                            _callback2();
                    }
                    else  {
                        logger.log(err);
                        res.send( {err:'Fail to resize the image file: '+err } );
                    }
                });
            };
        
            var crop = function() {
                gm( fileAutoOrinted )
                .crop(	imgWidth*_areaToCrop.width, 
                        imgHeight*_areaToCrop.height, 
                        imgWidth*_areaToCrop.x, 
                        imgHeight*_areaToCrop.y )
                .write( fileCropped, function (err) {
                    if (!err) {
                        resize();
                        fs.unlink(fileAutoOrinted);
                    }
                    else  {
                        logger.log(err);
                        res.send( {err:'Fail to crop the image file: '+err } );
                    }
                });
            };

            var getSize = function() {
                gm( fileAutoOrinted ).size(function(err, value){
                    imgWidth = value.width;
                    imgHeight = value.height;
                    crop();
                });
            };
            
            var autoOrient = function() {
                gm( _fileToProcess )
                .autoOrient()
                .write(fileAutoOrinted, function (err) {
                    if (!err) {
                        getSize();
                    }
                    else  {
                        logger.log(err);
                        res.send( {err:'Fail to auto orient the image file: '+err } );
                    }
                });
            };
            
            autoOrient();
            
        };
        
        //Client side can correctly preview the image with EXIF tags now
        /*
        if ( _osVersion == "iOS_6.0" || _osVersion == "iOS_6.0.1" ) { //for subsampling issue of iOS 6.0 & 6.0.1
            var fileRemovedProfile = path.join( _userDataDir, "temp_profile_removed."+fileNameExt );
            
            gm(fileToProcess)
            .noProfile()
            .write( fileRemovedProfile, function (err) {
                if (!err) {
                    cropAndResize( fileRemovedProfile, function() {
                        fs.unlink(fileRemovedProfile);
                        if (_callback1) {
                            _callback1();
                        }
                    });
                }
                else  {
                    logger.log(err);
                    res.send( {err:'Fail to remove EXIF in image file: '+err } );
                }
            });
        
        
        }
        else {
            cropAndResize( fileToProcess, function() {
                if (_callback1) {
                    _callback1();
                }
            });
        
        }
        */
        
        cropAndResize( fileToProcess, function() {
            if (_callback1) {
                _callback1();
            }
        });
        
    }

    var moveFile = function( _tmp_path, _target_path, _moveFile_cb )  {
        var util = require('util');
            
        var is = fs.createReadStream(_tmp_path);
        var os = fs.createWriteStream(_target_path);
        
        util.pump(is, os, function(err) {
            if (!err) {
                fs.unlink(_tmp_path, function() {
                    if (!err) {
                        logger.log( 'Finished uploading to ' + _target_path );
                        
                        if ( _moveFile_cb ) {
                            _moveFile_cb();
                        }
                    }
                    else {
                        logger.log('Fail to delete temporary uploaded file: '+err);
                        res.send( {err:'Fail to delete temporary uploaded file: '+err});
                    }
                });
            }
            else {
                logger.log('Fail to do util.pump(): '+err);
                res.send( {err:'Fail to do util.pump(): '+err } );
            }
        });			
    }

    //get the temporary location of the file
    var tmp_path = req.files['file'].path;
    //set where the file should actually exists 
    var target_path;
    
    logger.log('req.body.fileObjectID= '+ req.body.fileObjectID);
    
    
    if ( req.body.projectID ) {
        var projectDir = path.join( workingPath, 'public/contents/user_project', req.body.projectID);
        var userDataDir = path.join( projectDir, 'user_data');
        if ( !fs.existsSync(projectDir) ) {
            fs.mkdirSync( projectDir );  //TODO: check if this is expensive... 
        }
        if ( !fs.existsSync(userDataDir) ) {
            fs.mkdirSync( userDataDir );  //TODO: check if this is expensive... 
        }
        target_path = path.join( userDataDir, req.files['file'].name);
        
        if (req.body.format == "video"){
            moveFile( tmp_path, target_path, function() { 
                var newPath = path.join( userDataDir, "_"+req.files['file'].name );
                fs.rename(target_path, newPath, function(){
                    res.send(200, {message: "User content file is succesfully uploaded."});
                });
            });
        }
        else {  //req.body.format == "image"
        
            var areaToCrop, resizeTo;        
            areaToCrop = { 	x: req.body.croppedArea_x,
                            y: req.body.croppedArea_y,
                            width: req.body.croppedArea_width,
                            height: req.body.croppedArea_height };
                                
            resizeTo = { width: req.body.obj_OriginalWidth, height: req.body.obj_OriginalHeight};
            
            moveFile( tmp_path, target_path, function() { 
                processFile( userDataDir, req.files['file'].name, areaToCrop, resizeTo, req.body.osVersion, function() {
                    res.send(200, {message: "User content file is succesfully uploaded."});;
                });
            });
        }
        
    }
    else {
        target_path = path.join( workingPath, 'public/uploads', req.files['file'].name);  
        moveFile( tmp_path, target_path);
    }
    
    

};




module.exports = userContentHandler;