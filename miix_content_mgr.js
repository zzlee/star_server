/**
 * @fileoverview Implementation of miixContentMgr
 */
var fs = require('fs');
var path = require('path');
var xml2js = require('xml2js');
var async = require('async');

var workingPath = process.cwd();
var aeServerMgr = require(workingPath+'/ae_server_mgr.js');
var doohMgr = require(workingPath+'/dooh_mgr.js');
var memberDB = require(workingPath+'/member.js');
var UGCDB = require(workingPath+'/ugc.js');
var memberDB = require("./member.js");
var awsS3 = require('./aws_s3.js');
var fmapi = require(workingPath+'/routes/api.js');   //TODO:: find a better name
var db = require('./db.js');
var fbMgr = require('./facebook_mgr.js');


/**
 * The manager who coordinates the operations for Miix contents
 *
 * @mixin
 */
var miixContentMgr = {};


/**
 * Coordinate AE server to render Miix movie and save the content info to UGC db
 * 
 * @param {String} movieProjectID
 * @param {String} ownerStdID
 * @param {String} ownerFbID
 * @param {String} movieTitle
 */
miixContentMgr.generateMiixMoive = function(movieProjectID, ownerStdID, ownerFbID, movieTitle) {
    
    //console.log('generateMiixMoive is called.');
    var mediaType = "H.264";
    //var mediaType = "FLV";
    
    aeServerMgr.createMiixMovie( movieProjectID, ownerStdID, ownerFbID, movieTitle, mediaType, function(responseParameters){
        
        if ( responseParameters.youtube_video_id ) {
            var aeServerID = responseParameters.ae_server_id;
            var youtubeVideoID = responseParameters.youtube_video_id;
            var movieProjectID = responseParameters.movie_project_id;
            var ownerStdID = responseParameters.owner_std_id;
            var ownerFbID = responseParameters.owner_fb_id;
            var movieTitle = responseParameters.movie_title;
            var fileExtension = responseParameters.movie_file_extension;
            
            
            if ( responseParameters.err == 'null' || (!responseParameters.err) ) {
                //post to FB; update video DB; push notification to mobile client 
                var url = {"youtube":"http://www.youtube.com/embed/"+youtubeVideoID};			
                var vjson = {"title": movieTitle,
                             "ownerId": {"_id": ownerStdID, "userID": ownerFbID},
                             "url": url,
                             "genre":"miix",
                             "aeId": aeServerID,
                             "projectId": movieProjectID,
                             "mediaType": mediaType,
                             "fileExtension": fileExtension
                             };
                fmapi._fbPostUGCThenAdd(vjson); //TODO: split these tasks to different rolls
                
            }
            
            //for test
            //miixContentMgr.submitMiixMovieToDooh('', movieProjectID);
        }
        
    });
    
};

/**
 * Coordinate DOOH server to download Miix Content
 * 
 * @param {String} doohID
 * @param {String} miixMovieProjectID
 * @deprecated since Miix 2.0
 */
miixContentMgr.submitMiixMovieToDooh = function( doohID, miixMovieProjectID ) {
   
    UGCDB.getValueByProject(miixMovieProjectID, "fileExtension", function(err3, result){ 
        if (result){
            var miixMovieFileExtension = result.fileExtension;
            doohMgr.downloadMovieFromS3(miixMovieProjectID, miixMovieFileExtension,  function(resParametes){
                logger.info('downloading Miix movie from S3.');
                logger.info('res: _command_id='+resParametes._command_id+' err='+resParametes.err);
                
            }); 
        }                              
        else {
            logger.error("UGCDB.getValueByProject() failed: "+err3);
        }
        
    });
    
};


/**
 * Add some info some preliminary info of Miix movie to UGC db and ask AE Server to render Miix video.<br>  
 * <br>
 * These info are for clinet side to show some dummy icon for Miix movie which is under rendering
 * 
 * @param {String} ugcProjectID Project ID of this UGC
 * @param {Object} ugcInfo An object containing UGC info:
 *     <ul>
 *     <li>ownerId: ownerId An object containing owner's id info:
 *         <ul>                                                                             
 *         <li>_id: owner's member ID (hex string representation of its ObjectID in MongoDB)
 *         <li>fbUserId: owner's Facebook user ID                                                    
 *         </ul>                                                                            
 *     <li>contentGenre: it is normally the template (id) that this UGC uses
 *     <li>customizableObjects: an array of objects describing the customizable objects
 *     <li>title: title of UGC. This title will be used when it is posted on YouTube
 *     </ul>
 * @param {Function} cbOfPreAddMiixMovie Callback function called when adding operation is done
 */
miixContentMgr.preAddMiixMovie = function(ugcProjectID, ugcInfo, cbOfPreAddMiixMovie) {
    var movieProjectDir = path.join( workingPath, 'public/contents/user_project', ugcProjectID);
    var userDataDir = path.join( movieProjectDir, 'user_data');
    var userContentDescriptionFilePath = path.join( userDataDir, 'customized_content.xml');
    var customizableObjects = ugcInfo.customizableObjects;

    async.series([
        function(callback){
            //generate user content description file customized_content.xml
            var builder = require('xmlbuilder');
            var userDataXml = builder.create('customized_content',{'version': '1.0', 'encoding': 'UTF-8', 'standalone': true});
            userDataXml.ele('template_ID', ugcInfo.contentGenre);
            var customizableObjectListXml = userDataXml.ele('customizable_object_list');
            var customizableObjectXml = "";
            

            if( Object.prototype.toString.call( customizableObjects ) === '[object Array]' ) {
                for (var i in customizableObjects) {
                    //append the content in customized_content.xml
                    customizableObjectXml = customizableObjectListXml.ele('customizable_object');
                    customizableObjectXml.ele('ID', customizableObjects[i].ID );
                    customizableObjectXml.ele('format', customizableObjects[i].format);
                    customizableObjectXml.ele('content', "_"+customizableObjects[i].content);
                }
            }
            else {
                //append the content in customized_content.xml
                customizableObjectXml = customizableObjectListXml.ele('customizable_object');
                customizableObjectXml.ele('ID', customizableObjects.ID );
                customizableObjectXml.ele('format', customizableObjects.format);
                customizableObjectXml.ele('content', "_"+customizableObjects.content);
            }
            
            //finalize customized_content.xml 
            var xmlString = userDataXml.end({ 'pretty': true, 'indent': '  ', 'newline': '\n' });
            //logger.info(userDataXml);
            //TODO: create userDataDir if it does not exist 
            if ( fs.existsSync(userDataDir) ) {
                fs.writeFile(userContentDescriptionFilePath, xmlString, function(errOfWriteFile){
                    if (!errOfWriteFile){
                        callback(null);
                    }
                    else {
                        callback("Failed to write to customized_content.xml: "+errOfWriteFile);
                    }
                }); 
            }

        },
        function(callback){
            //save customized_content.xml to S3 
            var s3Path =  '/user_project/' + ugcProjectID + '/user_data/'+ "customized_content.xml";
            awsS3.uploadToAwsS3(userContentDescriptionFilePath, s3Path, 'text/xml', function(errOfUploadToAwsS3, result){
                if (!errOfUploadToAwsS3){
                    callback(null);
                }
                else {
                    callback("Failed to save customized_content.xml to S3: "+errOfUploadToAwsS3);
                }
            });
        },
        function(callback){
            //Add UGC info to UGC db 
            var vjson = {
                    "ownerId": {"_id": ugcInfo.ownerId._id, "userID": ugcInfo.ownerId.fbUserId, "fbUserId": ugcInfo.ownerId.fbUserId},
                    "projectId": ugcProjectID,
                    "genre": "miix",
                    "contentGenre": ugcInfo.contentGenre,
                    "title": ugcInfo.title
                };

            UGCDB.addUGC(vjson, function(errOfAddUGC, newlyAddedUgc){
                if (!errOfAddUGC){
                    for (var i=0; i<customizableObjects.length; i++){
                        if (customizableObjects[i].format=="text") {
                            vjsonCustomizableObject = {
                                "id": customizableObjects[i].ID,
                                "type": customizableObjects[i].format,
                                "content": customizableObjects[i].content
                            };
                        }
                        else { // customizableObjects[i].format=="image" or "video"
                            var userContentS3Path = '/user_project/' + ugcProjectID + '/user_data/_'+ customizableObjects[i].content;
                            var userContentS3Url = "https://s3.amazonaws.com/miix_content" + userContentS3Path;
                            vjsonCustomizableObject = {
                                "id": customizableObjects[i].ID,
                                "type": customizableObjects[i].format,
                                "content": userContentS3Url
                            };
                        }
                        
                        newlyAddedUgc.userRawContent.push(vjsonCustomizableObject);
                    }
                    newlyAddedUgc.save(function(errPushUserRawContent){
                        if (!errPushUserRawContent){
                            logger.info('Miix movie info is successfully saved to UGC db: '+ugcProjectID);
                            callback(null);
                        }
                        else {
                            logger.info('Miix movie info failed to saved to UGC db: '+errPushUserRawContent);
                            callback('Miix movie info failed to saved to UGC db: '+errPushUserRawContent);
                        }
                    });
                }
                else {
                    callback("Failed to add UGC info to UGC db: "+errOfAddUGC);
                }
            });
        },
        function(callback){
            //check if all the user data exist. If yes, start generating the movie in miixContentMgr.generateMiixMoive
            //TODO: use async to better check file existance
            var allUserContentExist = true;
            if( Object.prototype.toString.call( customizableObjects ) === '[object Array]' ) {
                for (var i in customizableObjects) {
                    allUserContentExist = allUserContentExist && fs.existsSync( path.join( userDataDir, "_"+customizableObjects[i].content) );
                }
            }
            else {
                allUserContentExist = fs.existsSync( path.join( userDataDir, "_"+customizableObjects.content) );
            }

            if ( allUserContentExist ) {
                logger.info('Start generating movie '+ ugcProjectID +'!');
                miixContentMgr.generateMiixMoive(ugcProjectID, ugcInfo.ownerId._id, ugcInfo.ownerId.fbUserId, ugcInfo.title);
                callback(null);
            }
            else {
                callback("Cannot generate UGC because some or all user contents are missing.");
            }
        }
    ],
    function(err, results){
        if (cbOfPreAddMiixMovie){
            cbOfPreAddMiixMovie(err);
        }
    });
    
    
    

};

/**
 * Add a Miix image to system. <br>  
 * <br>
 * Miix image content body (in base64 format) is saved as a PNG and put onto AWS S3; the complete set of  
 * content info is save to UGC db
 * 
 * @param {String} imgBase64 image date with base64 format
 * @param {String} ugcProjectID Project ID of this UGC
 * @param {Object} ugcInfo An object containing UGC info:
 *     <ul>
 *     <li>ownerId: ownerId An object containing owner's id info:
 *         <ul>                                                                             
 *         <li>_id: owner's member ID (hex string representation of its ObjectID in MongoDB)
 *         <li>fbUserId: owner's Facebook user ID                                                    
 *         </ul>                                                                            
 *     <li>contentGenre: it is normally the template (id) that this UGC uses
 *     <li>title: title of UGC 
 *     </ul>
 * @param {Function} cbOfAddMiixImage Callback function called when adding operation is done
 */
miixContentMgr.addMiixImage = function(imgBase64, ugcProjectID, ugcInfo, cbOfAddMiixImage) {
    var imageUgcFile = null;
    var ugcS3Path = null;
    var ugcS3Url = null;    
    debugger;
    
    async.series([
        function(callback){
            //Save base64 image to a PNG file
            
            var projectDir = path.join( workingPath, 'public/contents/user_project', ugcProjectID);
            async.waterfall([
                function(callbackOfWaterfall){
                    //check if project dir exists
                    fs.exists(projectDir, function (exists) {
                        callbackOfWaterfall(null, exists);
                    });
                },
                function(projectDirExists, callbackOfWaterfall){
                    //if not exists, create one
                    if (!projectDirExists) {
                        fs.mkdir(projectDir, function(errOfMkdir){
                            if (!errOfMkdir) {
                                callbackOfWaterfall(null);
                            }
                            else {
                                callbackOfWaterfall("Failed to create the project dir "+projectDir+": "+errOfMkdir);
                            }
                        });
                    }
                    else {
                        callbackOfWaterfall(null);
                    }
                },
                function(callbackOfWaterfall){
                    //now save the base64 image to a PNG file
                    var base64Data = imgBase64.replace(/^data:image\/png;base64,/,"");
                    imageUgcFile = path.join(workingPath,"public/contents/user_project", ugcProjectID, ugcProjectID+".png");

                    fs.writeFile(imageUgcFile, base64Data, 'base64', function(errOfWriteFile) {
                        if (!errOfWriteFile){
                            callbackOfWaterfall(null);
                        }
                        else {
                            callbackOfWaterfall("Fail to save base64 image to a PNG file: "+errOfWriteFile);
                        }
                        
                    });
                }
            ], function (err, result) {
                callback(err);    
            });
            
        },
        function(callback){
            //Upload the PNG (user content) file to S3
            ugcS3Path =  '/user_project/' + ugcProjectID + '/'+ ugcProjectID+".png";
            awsS3.uploadToAwsS3(imageUgcFile, ugcS3Path, 'image/png', function(err,result){
                if (!err){
                    logger.info('Miix image is successfully uploaded to S3 '+ugcS3Path);
                    callback(null, ugcS3Path);
                }
                else {
                    logger.info('Miix image is failed to be uploaded to S3 '+ugcS3Path);
                    callback('Miix movie is failed to be uploaded to S3 '+ugcS3Path, null);
                }
            });
        },
        function(callback){
            //Add UGC info (including user content info) to UGC db
            var customizableObjects = ugcInfo.customizableObjects;
            ugcS3Url = "https://s3.amazonaws.com/miix_content" + ugcS3Path;
            var vjson = {
                    "ownerId": {"_id": ugcInfo.ownerId._id, "userID": ugcInfo.ownerId.fbUserId, "fbUserId": ugcInfo.ownerId.fbUserId},
                    "projectId": ugcProjectID,
                    "genre": "miix_image",
                    "contentGenre": ugcInfo.contentGenre,
                    "mediaType": "PNG",
                    "fileExtension": "png",
                    "title": ugcInfo.title,
                    "url": {"s3":ugcS3Url}//, 
                    //"userRawContent": JSON.stringify(customizableObjects)
                };

            UGCDB.addUGC(vjson, function(errAddUgc, newlyAddedUgc){
                var vjsonCustomizableObject = null;
                if (!errAddUgc){
                    for (var i=0; i<customizableObjects.length; i++){
                        
                        if (customizableObjects[i].type=="text") {
                            vjsonCustomizableObject = {
                                "id": customizableObjects[i].id,
                                "type": customizableObjects[i].type,
                                "content": customizableObjects[i].content
                            };
                            newlyAddedUgc.userRawContent.push(vjsonCustomizableObject);
                        }
                        else if ((customizableObjects[i].type=="image")||(customizableObjects[i].type=="video")) {  
                            var userContentS3Path = '/user_project/' + ugcProjectID + '/user_data/_'+ customizableObjects[i].content;
                            var userContentS3Url = "https://s3.amazonaws.com/miix_content" + userContentS3Path;
                            vjsonCustomizableObject = {
                                "id": customizableObjects[i].id,
                                "type": customizableObjects[i].type,
                                "content": userContentS3Url
                            };
                            newlyAddedUgc.userRawContent.push(vjsonCustomizableObject);
                        }
                    }
                    newlyAddedUgc.save(function(errPushUserRawContent){
                        if (!errPushUserRawContent){
                            logger.info('Miix image info is successfully saved to UGC db: '+ugcProjectID);
                            callback(null);
                        }
                        else {
                            logger.info('Miix image info failed to saved to UGC db: '+errPushUserRawContent);
                            callback('Miix image info failed to saved to UGC db: '+errPushUserRawContent);
                        }
                    });
                    
                    
                    
                }
                else {
                    logger.info('Miix image info failed to saved to UGC db: '+errAddUgc);
                    callback('Miix image info failed to saved to UGC db: '+errAddUgc);
                }
            });
        },
        function(callback){
            //post on Facebook
//            memberDB.getFBAccessTokenById(ugcInfo.ownerId._id, function(errOfGetFBAccessTokenById, result){
//                
//               if (!errOfGetFBAccessTokenById){
//                   //var userID = result.fb.userID;
//                   //var userName = result.fb.userName;
//                   var can_msg =  "上大螢幕活動初體驗！";
//                   var accessToken = result.fb.auth.accessToken;
//                   fbMgr.postMessage(accessToken, can_msg, ugcS3Url, function(errOfPostMessage, result){
//                       //console.log("result=%s", result);
//                       if (!errOfPostMessage) {
//                           callback(null);
//                       }
//                       else {
//                           callback("Failed to post FB: "+errOfPostMessage);
//                       }
//                   });
//               }
//               else {
//                   callback("Failed to get FB access token from member DB: "+errOfGetFBAccessTokenById);
//               }
//                
//            });
        }
    ],
    function(err, results){
        if (cbOfAddMiixImage){
            cbOfAddMiixImage(err);
        }
    });
};


/**
 * Get the url of user-uploaded image <br>  
 * 
 * @param {String} miixMovieProjectID
 * @param {Function} gotUrls_cb
 */
miixContentMgr.getUserUploadedImageUrls = function( miixMovieProjectID, gotUrls_cb) {
    var userUploadedImageUrls = [];
    var anUserUploadedImageUrl;
    var userContentXmlFile = path.join( workingPath, 'public/contents/user_project', miixMovieProjectID, 'user_data/customized_content.xml');
    var parser = new xml2js.Parser({explicitArray: false});
    fs.readFile( userContentXmlFile, function(err, data) {
        if (!err){
            parser.parseString(data, function (err2, result) {
                if (!err2){
                    var customizable_objects = result.customized_content.customizable_object_list.customizable_object;
                    
                    if( Object.prototype.toString.call( customizable_objects ) === '[object Array]' ){
                        for (var i=0;i<customizable_objects.length;i++) {
                            anUserUploadedImageUrl = '/contents/user_project/'+miixMovieProjectID+'/user_data/'+customizable_objects[i].content;
                            userUploadedImageUrls.push( anUserUploadedImageUrl );
                        }
                    }
                    else{
                        anUserUploadedImageUrl = '/contents/user_project/'+miixMovieProjectID+'/user_data/'+customizable_objects.content;
                        userUploadedImageUrls.push( anUserUploadedImageUrl );
                    }
                    if (gotUrls_cb) {
                        gotUrls_cb(userUploadedImageUrls, null);
                    }
                }
                else{
                    if (gotUrls_cb) {
                        gotUrls_cb(null, err2);
                    }
                }
            });
        }
        else {
            if (gotUrls_cb) {
                gotUrls_cb(null, err);
            }		
        }
    });
};

/**
 * Retrieve the latest highlights of UGCs.<br>
 * 
 * @param {Number} limit The number of UGC highlights to retrieve
 * @param {Function} cbOfGetUgcHighlights The callback function called when finishing retrieving. It has the following signature:<br>
 *     cbOfGetUgcHighlights(err, ugcHighlightList)
 */
miixContentMgr.getUgcHighlights = function(limit, cbOfGetUgcHighlights){
    
    var ugcModel = db.getDocModel("ugc");
    //TODO: change to query to meet the requirements
    ugcModel.find({ "rating": "A", $or: [ { "contentGenre":"miix_it" }, { "contentGenre": "mood"} ] }).sort({"createdOn":-1}).limit(limit).exec(function (err, ugcHighlights) {
        //TODO: get UGC owner's FB user name 
        
        if (!err){
            cbOfGetUgcHighlights(null, ugcHighlights);
        }
        else {
            cbOfGetUgcHighlights("Fail to retrieve UGC highlights from DB: "+err, ugcHighlights);
        }
        
    });
};



module.exports = miixContentMgr;

/*
//test
miixContentMgr.getUserUploadedImageUrls('greeting-50c99d81064d2b841200000a-20130129T072747490Z', function(userUploadedImageUrls, err){
    console.log('userUploadedImageUrls=');
    console.dir(userUploadedImageUrls);
});
*/