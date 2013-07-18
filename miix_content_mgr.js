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
var awsS3 = require('./aws_s3.js');
var fmapi = require(workingPath+'/routes/api.js');   //TODO:: find a better name

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
    //var mediaType = "H.264";
    var mediaType = "FLV";
    
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
                
            };
            
            //for test
            //miixContentMgr.submitMiixMovieToDooh('', movieProjectID);
        };
        
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
 * Add some info some preliminary info of Miix movie to UGC db while AE is rending its concrete content.<br>  
 * <br>
 * These info are for clinet side to show some dummy icon for Miix movie which is under rendering
 * 
 * @param {String} doohID
 * @param {String} miixMovieProjectID
 */
miixContentMgr.preAddMiixMovie = function() {
    
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
    var s3Path;
    
    async.series([
        function(callback){
            //Save base64 image to a PNG file
            var base64Data = imgBase64.replace(/^data:image\/png;base64,/,"");
            imageUgcFile = path.join(workingPath,"public/contents/temp", ugcProjectID+".png");

            fs.writeFile(imageUgcFile, base64Data, 'base64', function(errOfWriteFile) {
                if (!errOfWriteFile){
                    callback(null);
                }
                else {
                    callback("Fail to save base64 image to a PNG file: "+errOfWriteFile);
                }
                
            });
            
        },
        function(callback){
            //Upload the PNG file to S3
            s3Path =  '/user_project/' + ugcProjectID + '/'+ ugcProjectID+".png";
            awsS3.uploadToAwsS3(imageUgcFile, s3Path, 'image/png', function(err,result){
                if (!err){
                    logger.info('Miix image is successfully uploaded to S3 '+s3Path);
                    callback(null, s3Path);
                }
                else {
                    logger.info('Miix image is failed to be uploaded to S3 '+s3Path);
                    callback('Miix movie is failed to be uploaded to S3 '+s3Path, null);
                }
            });
        },
        function(callback){
            //Add UGC info to UGC db
            var s3Url = "https://s3.amazonaws.com/miix_content"+s3Path;
            var vjson = {
                    "ownerId": {"_id": ugcInfo.ownerId._id, "userID": ugcInfo.ownerId.fbUserId, "userID": ugcInfo.ownerId.fbUserId},
                    "projectId": ugcProjectID,
                    "genre": "miix_image",
                    "contentGenre": ugcInfo.contentGenre,
                    "mediaType": "PNG",
                    "fileExtension": "png",
                    "title": ugcInfo.title,
                    "url": {"s3":s3Url}
                };

            UGCDB.addUGC(vjson, function(errAddUgc, result){
                if (!errAddUgc){
                    logger.info('Miix image info is successfully saved to UGC db: '+ugcProjectID);
                    callback(null);
                }
                else {
                    logger.info('Miix image info failed to saved to UGC db');
                    callback('Miix image info failed to saved to UGC db: '+errAddUgc);
                }
            });
        }
    ],
    function(err, results){
        cbOfAddMiixImage(err);
    });

    
    
    
    
    
    
};

/**
 * Get the url of user-uploaded image <br>  
 * 
 * @param {String} miixMovieProjectID
 * @param {Function} gotUrls_cb
 */
miixContentMgr.getUserUploadedImageUrls = function( miixMovieProjectID, gotUrls_cb) {
    var userUploadedImageUrls = new Array();
    var anUserUploadedImageUrl;
    var userContentXmlFile = path.join( workingPath, 'public/contents/user_project', miixMovieProjectID, 'user_data/customized_content.xml')
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



module.exports = miixContentMgr;

/*
//test
miixContentMgr.getUserUploadedImageUrls('greeting-50c99d81064d2b841200000a-20130129T072747490Z', function(userUploadedImageUrls, err){
    console.log('userUploadedImageUrls=');
    console.dir(userUploadedImageUrls);
});
*/