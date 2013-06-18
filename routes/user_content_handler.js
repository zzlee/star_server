var userContentHandler = {};

var fs = require('fs');
var path = require('path');
var workingPath = process.cwd();

var miixContentMgr = require(workingPath+'/miix_content_mgr.js');
/*
 * handle file upload
 */

//POST /miix/videos/user_content_files
userContentHandler.uploadUserContentFile_cb = function(req, res){
    var awsS3 = require('../aws_s3.js');

    var processFile = function( _userDataDir, _imageFileToProcess, _areaToCrop, _resizeTo, _osVersion, _callback1 ) {
        //var fileNameBody = _imageFileToProcess.substring(0, _imageFileToProcess.lastIndexOf(".") )
        var fileNameExt = _imageFileToProcess.substr( _imageFileToProcess.lastIndexOf('.')+1 );
        var fileToProcess = path.join( _userDataDir, _imageFileToProcess);
        var fileAutoOrinted = path.join( _userDataDir, "temp_auto_orient."+fileNameExt );
        var fileCropped = path.join( _userDataDir, "temp_cropped."+fileNameExt );
        var fileResized = path.join( _userDataDir, "_"+_imageFileToProcess );
        var imgWidth=0, imgHeight=0;
        
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
        
    };

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
    };

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
            areaToCrop = {  x: req.body.croppedArea_x,
                            y: req.body.croppedArea_y,
                            width: req.body.croppedArea_width,
                            height: req.body.croppedArea_height };
                                
            resizeTo = { width: req.body.obj_OriginalWidth, height: req.body.obj_OriginalHeight};
            
            moveFile( tmp_path, target_path, function() { 
                processFile( userDataDir, req.files['file'].name, areaToCrop, resizeTo, req.body.osVersion, function() {
                    var localPath = path.join( userDataDir, "_"+req.files['file'].name);
                    var s3Path =  '/user_project/' + req.body.projectID + '/user_data/'+ req.files['file'].name;
                    //console.log('s3Path = %s', s3Path);
                    awsS3.uploadToAwsS3(localPath, s3Path, 'image/jpeg', function(err,result){
                        if (!err){
                            logger.log('User content file is successfully saved to S3 '+s3Path);
                            res.send(200, {message: "User content file is succesfully uploaded."});
                        }
                        else {
                            logger.log('User content file is failed to be saved to S3 '+s3Path);
                            res.send(500 , {message: "Failed to saved to S3"});
                        }
                    });
                    
                });
            });
        }
        
    }
    else {
        target_path = path.join( workingPath, 'public/uploads', req.files['file'].name);  
        moveFile( tmp_path, target_path);
    }
    
    

};


//POST /miix/videos/user_content_description
userContentHandler.uploadUserDataInfo_cb = function(req, res) {

    var movieProjectDir = path.join( workingPath, 'public/contents/user_project', req.body.projectID);
    var userDataDir = path.join( movieProjectDir, 'user_data');
    
    var writeTo_customized_content_xml_cb = function (err) {
        if (!err) {
            logger.log('customized_content.xml is generated.');
            
            //check if all the user data exist; (if yes, start generating the movie in startGeneratingMovie()
            var allUserContentExist = true;
            if( Object.prototype.toString.call( req.body.customizableObjects ) === '[object Array]' ) {
                for (var i in req.body.customizableObjects) {
                    allUserContentExist = allUserContentExist && fs.existsSync( path.join( userDataDir, "_"+req.body.customizableObjects[i].content) );
                }
            }
            else {
                allUserContentExist = fs.existsSync( path.join( userDataDir, "_"+req.body.customizableObjects.content) );
            }

            if ( allUserContentExist ) {
                logger.log('Start generating movie '+ req.body.projectID +'!');
                res.send(null);
                //movieMaker.renderMovie(req.body.projectID, req.body.ownerID);
                var videoTitle =  "MiixCard movie";
                //aeServerManager.createMovie(aeServer, req.body.projectID, req.body.ownerID._id, req.body.ownerID.fb_userID, videoTitle);
                //aeServerManager.createMovie_longPolling("gance_Feltmeng_pc", req.body.projectID, req.body.ownerID._id, req.body.ownerID.fb_userID, videoTitle);
                miixContentMgr.generateMiixMoive(req.body.projectID, req.body.ownerID._id, req.body.ownerID.fb_userID, videoTitle);
            }
            else {
                res.send( {err:"Some or all user contents are missing."} );
            }
            
        }
    }
    


    //==append the content in customized_content.xml==
    var builder = require('xmlbuilder');
    var userDataXml = builder.create('customized_content',{'version': '1.0', 'encoding': 'UTF-8', 'standalone': true});
    userDataXml.ele('template_ID', req.body.templateID);
    var customizableObjectListXml = userDataXml.ele('customizable_object_list');
    

    if( Object.prototype.toString.call( req.body.customizableObjects ) === '[object Array]' ) {
        for (var i in req.body.customizableObjects) {
            //append the content in customized_content.xml
            var customizableObjectXml = customizableObjectListXml.ele('customizable_object');
            customizableObjectXml.ele('ID', req.body.customizableObjects[i].ID );
            customizableObjectXml.ele('format', req.body.customizableObjects[i].format);
            customizableObjectXml.ele('content', "_"+req.body.customizableObjects[i].content);
        }
    }
    else {
        //append the content in customized_content.xml
        var customizableObjectXml = customizableObjectListXml.ele('customizable_object');
        customizableObjectXml.ele('ID', req.body.customizableObjects.ID );
        customizableObjectXml.ele('format', req.body.customizableObjects.format);
        customizableObjectXml.ele('content', "_"+req.body.customizableObjects.content);
    }
    
    //finalize customized_content.xml 
    var xmlString = userDataXml.end({ 'pretty': true, 'indent': '  ', 'newline': '\n' });
    //logger.log(userDataXml);
    if ( fs.existsSync(userDataDir) ) {
        fs.writeFile(userDataDir+'/customized_content.xml', xmlString, writeTo_customized_content_xml_cb ); 
    }

};



module.exports = userContentHandler;