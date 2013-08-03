/**
 *  story_cam_controller_handler.js
 */
 
var FM = { storyCamControllerHandler: {} };
var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ logger.info( typeof(str)==='string' ? str : JSON.stringify(str)); } : function(str){} ;

var storyContentMgr = require('../story_content_mgr.js');  

var fs = require('fs'),
    path = require('path');
var awsS3 = require('../aws_s3.js');
var db = require('../db.js');
var UGCDB = require(process.cwd()+'/ugc.js');
var programTimeSlotModel = db.getDocModel("programTimeSlot");
var ugcModel = db.getDocModel("ugc");
var execFile = require('child_process').execFile;
var savePath = '';
var fileList = [];
var ownerList = [];
var awsS3List = [];
    
//POST /internal/story_cam_controller/available_story_movie
FM.storyCamControllerHandler.availableStoryMovie_post_cb = function(req, res) {

    if ( req.headers.miix_movie_project_id ) {
        storyContentMgr.generateStoryMV( req.headers.miix_movie_project_id );
        res.send(200);
    }
	else {
		res.send(400, {error: "Bad Request!"} );
	}

};

FM.storyCamControllerHandler.availableStreetMovies = function(req, res){
    
    //test recordTime: 1374309992529
    
    var recordTime = req.params.playTime;
    
    getStreetVideo(recordTime, function(err, res){
        findMember(recordTime, function(err, programInterval){
            cuttingImageFromVideo(programInterval, function(err, res){
                uploadToAwsS3(function(awsStatus){
                    updateToUGC(function(ugc_cb){
                        clearMemory(function(clearStatus){
                            //console.log(clearStatus);
                        });
                    });
                });
                //
            });
        });
    });
    /* step 1 : download video */
    /* step 2 : find member in database */
    /* step 3 : cutting image from video */
    //cuttingImageFromVideo(programInterval, function(err, res));
    /* step 4 : image naming */
    //imageNaming(programInterval, function(err, res));
    /* step 5 : upload to aws s3 */
    //uploadAwsS3(source, function(err, res));
    /* step 6 : update to ugc database */
    //updateToUGC();
    
    res.end();
};

var getStreetVideo = function(recordTime, report_cb){
    var s3Path =  '/camera_record/' + recordTime + '/'+ recordTime + '__story.avi';
    savePath = path.join(__dirname, recordTime + '__story.avi');
    fileList.push(savePath);
    awsS3.downloadFromAwsS3(savePath, s3Path, function(err, res){
        report_cb(err, res);
    });
};

var findMember = function(recordTime, find_cb){
    var count = 0;
    var schema = {};
    
    programTimeSlotModel.find({ 
        "timeslot.start": {$lte: recordTime}, 
        "timeslot.end": {$gte: recordTime}, 
        //"type": "UGC",
    }).sort({timeStamp:1}).exec(function (_err, result) {
        for(var i=0; i<result.length; i++)
            (result[i].type == 'UGC') ? count++ : '';
        schema.count = count;
        schema.list = result;
        find_cb(_err, schema);
    });
};

var cuttingImageFromVideo = function(programInterval, cuttingImage_cb){

    var cuttingTime = programInterval.count;
    var source = savePath;
    var name = '',
        part = 0,
        playTime = 0.0;

    var cuttingImage = function(){
        
        if(programInterval.list[part].type != 'UGC') {
            playTime += parseInt(programInterval.list[part].timeslot.playDuration / 1000);
            if(0 == cuttingTime)
                cuttingImage_cb(null, 'ok');
            else if(part > programInterval.list.length)
                cuttingImage_cb(null, 'no find program');
            else {
                part++;
                cuttingImage();
            }
        }
        else {
            imageNaming(programInterval.list[part], function(dest){
                fileList.push(path.join(__dirname, dest));
                cutImage(source, path.join(__dirname, dest), parseInt(playTime)+1, function(status){
                    playTime += parseInt(programInterval.list[part].timeslot.playDuration / 1000);
                    cuttingTime--;
                    if(0 == cuttingTime)
                        cuttingImage_cb(null, 'ok');
                    else if(part > programInterval.list.length)
                        cuttingImage_cb(null, 'no find program');
                    else {
                        part++;
                        cuttingImage();
                    }
                });
            });
        }
    };
    cuttingImage();
};

var cutImage = function(source, dest, specificTime, cutImage_cb){
    //ffmpeg -i {source} -y -f image2 -ss {specificTime} -vframes 1 {dest}
    execFile(path.join('ffmpeg.exe'), ['-y', '-i', source, '-f', 'image2', '-ss', specificTime, '-frames:v', '1', '-an', dest], function(error, stdout, stderr){
        cutImage_cb('done');
    });
};

var imageNaming = function(ugcInfo, naming_cb){
    //[contentGenre]-[ownerId._id]-[time stamp]
    var name = '';
    ugcModel.find({"_id": ugcInfo.content._id}).exec(function (_err, result) {
        //console.log(result[0].ownerId._id);
        ownerList.push(result[0].ownerId);
        name = ugcInfo.contentGenre + '-' + 
               result[0].ownerId._id + '-' + 
               ugcInfo.timeStamp + '.jpg';
        naming_cb(name);
    });
};

var uploadToAwsS3 = function(awsS3_cb){

    var s3Path = '';
    var projectFolder = '';

    console.log(ownerList);
    var i = 0;
    var upload = function(){
        var filetype = fileList[i].split('.');
        if((filetype[filetype.length-1] == 'jpg')||(filetype[filetype.length-1] == 'png')) {
            projectFolder = filetype[0].split('\\');
            s3Path = '/user_project/' + projectFolder[projectFolder.length-1] + '/' + projectFolder[projectFolder.length-1] + '.' + filetype[filetype.length-1];
            awsS3List.push(s3Path);
            awsS3.uploadToAwsS3(fileList[i], s3Path, 'video/x-msvideo', function(err,result){
                if (!err){
                    logger.info('Story movie was successfully uploaded to S3 '+s3Path);
                 }
                else {
                    logger.info('Story movie failed to be uploaded to S3 '+s3Path);
                }
            });
        }
        i++;
        (i < fileList.length)?upload():awsS3_cb('done');
    };
    upload();
};

var updateToUGC = function(updateUGC_cb){

    var i = 0;
    
    var update = function(){
        var projectId = awsS3List[i].split('/');
        projectId = projectId[projectId.length-1].split('.');
        var vjson = {
            "ownerId": { '_id': ownerList[i]._id, 
                         'fbUserId': ownerList[i].fbUserId,
                         'userID': ownerList[i].userID },
            'url': { 's3': awsS3List[i] },
            'genre': 'miix_image_live_photo',
            'projectId': projectId[0]
        };
        UGCDB.addUGC(vjson, function(err, result){
            //if(err) console.log(err);
            //else console.log(result);
            //if(!err) fmapi._fbPostUGCThenAdd(vjson);
            i++;
            (i < ownerList.length)?update():updateUGC_cb('done');
        });
    };
    update();
};

var clearMemory = function(clear_cb){
    savePath = '';
    for(var i=0; i<fileList.length; i++){
        fs.unlink(fileList[i]);
    };
    fileList = [];
    ownerList = [];
    awsS3List = [];
    
    clear_cb('done');
};

module.exports = FM.storyCamControllerHandler;