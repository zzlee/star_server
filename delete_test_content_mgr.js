var awsS3 = require('./aws_s3.js');
var youtubeMgr = require('./youtube_mgr.js');
var db = require('./db.js');

var FM = { deleteTestContentMgr : {} };

var UGCs = db.getDocModel("ugc");


//TODO get accessToken need better solution
var deleteFlag = 0;//chang deleteFlag value and refresh youtube token 

FM.deleteTestContentMgr.deleteYoutubeTestVideo = function(accessToken, delete_cb){
    var video_ID = null;
    if(deleteFlag != 0){
        var query = UGCs.find();
        query.exec(function(err, result){
            for(var i=0 ; i<result.length; i++){

                if(result[i].projectId && result[i].projectId.substring(0,4) =='test'){
                    if(result[i].url.youtube){
                        video_ID = result[i].url.youtube.substring(29,40);
                        console.log(video_ID);
                        youtubeMgr.deleteYoutubeVideo_http(video_ID, accessToken, function(err, result){
                            console.log(video_ID+accessToken);
                            if(!err)
                                delete_cb(null ,'successful');
                            else{
                                delete_cb(err , null);
                            }
                        });
                    }

                }
            } 

        });

    }

};

FM.deleteTestContentMgr.listYoutubeTestVideo = function(){
    var video_ID = null;

    var query = UGCs.find();
    query.exec(function(err, result){
        for(var i=0 ; i<result.length; i++){

            if(result[i].projectId && result[i].projectId.substring(0,4) =='test'){
                if(result[i].url.youtube){
                    console.log(i.toString()+'-'+result[i].url.youtube);
                    video_ID = result[i].url.youtube.substring(29,40);
                    console.log(video_ID);
                }

            }
        } 

    });


};

FM.deleteTestContentMgr.listTestObjInAwsS3 = function(){

    awsS3.listAwsS3('user_project/test' ,function(err, result){
        if(result.Contents.length >0){
        for(var i=0 ; i<result.Contents.length; i++){
            console.log(result.Contents[i].Key);
        }
        }else{
            console.log('No Test data!');
        }
        

    });

};


FM.deleteTestContentMgr.deleteTestObjInAwsS3 = function(){

    awsS3.listAwsS3('user_project/test' ,function(err, result){
        
        for(var i=0 ; i<result.Contents.length; i++){
            console.log(result.Contents[i].Key);
            awsS3.deleteAwsS3(result.Contents[i].Key, function(err, result){
                console.log('deleteAwsS3'+err+result);
                if(!err)
                    console.log(result);
                else{
                    console.log(err);
                }
            });
        } 

    });

};

FM.deleteTestContentMgr.listTestUGC = function(accessToken, delete_cb){
    var count = 0;

    var query = UGCs.find();
    query.exec(function(err, result){
        for(var i=0 ; i<result.length; i++){

            if(result[i].projectId && result[i].projectId.substring(0,4) =='test'){
                    console.log(result[i]._id+result[i].projectId);
                    count++;
            }
        }
        if(count == 0)
            console.log('No Test data!');

    });


};
FM.deleteTestContentMgr.deleteTestUGC = function(accessToken, delete_cb){
    var count = 0;

    var query = UGCs.find();
    query.exec(function(err, result){
        for(var i=0 ; i<result.length; i++){

            if(result[i].projectId && result[i].projectId.substring(0,4) =='test'){
                    console.log(result[i]._id+result[i].projectId);
                    UGCs.findByIdAndRemove(result[i]._id, function(err, result){
                    if(!err)
                        console.log(result);
                    else{
                        console.log(err);
                    }
                });
                    count++;
            }
        }
        if(count == 0)
            console.log('No Test data!');

    });


};


//FM.deleteTestContentMgr.deleteYoutubeTestVideo();
//FM.deleteTestContentMgr.deleteTestObjInAwsS3();
//FM.deleteTestContentMgr.listYoutubeTestVideo();
//FM.deleteTestContentMgr.listTestObjInAwsS3();
//FM.deleteTestContentMgr.listTestUGC();
//FM.deleteTestContentMgr.deleteTestUGC();

module.exports = FM.deleteTestContentMgr;