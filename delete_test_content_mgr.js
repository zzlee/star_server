var awsS3 = require('./aws_s3.js');
var youtubeMgr = require('./youtube_mgr.js');
var db = require('./db.js');
var readline = require('readline');

var FM = { deleteTestContentMgr : {} };

var UGCs = db.getDocModel("ugc");


FM.deleteTestContentMgr.deleteTestContentController = function(){

    console.log('welcome to delete_test_data_mgr!');
    console.log('1. list Youtube Test Video !');
    console.log('2. list Test Obj In Aws S3 !');
    console.log('3. list Test UGC !');
    console.log('4. delete Test Obj In AwsS3 !');
    console.log('5. delete Test UGC !');
    console.log('6. delete Youtube Test Video !');

    rl = readline.createInterface(process.stdin, process.stdout);

    rl.setPrompt('enter> ');
    rl.prompt();

    rl.on('line', function(line) {
      switch(line.trim()) {
        case '1':
          FM.deleteTestContentMgr.listYoutubeTestVideo();
          break;
        case '2':
          FM.deleteTestContentMgr.listTestObjInAwsS3();
            break;
        case '3':
            FM.deleteTestContentMgr.listTestUGC();
            break;
        case '4':
          FM.deleteTestContentMgr.deleteTestObjInAwsS3();
            break;
        case '5':
          FM.deleteTestContentMgr.deleteTestUGC();
            break;
        case '6':
            FM.deleteTestContentMgr.deleteYoutubeTestVideo();
            break;
        default:
          console.log('You have to enter some number!(1~6)');
          break;
      }
      rl.prompt();
    }).on('close', function() {
      console.log('Have a great day!');
      process.exit(0);
    });

};


FM.deleteTestContentMgr.deleteYoutubeTestVideo = function( delete_cb){
    var video_ID = null;
    var accessToken = null;
    
    youtubeMgr.getAccessToken( function(err, result){
        console.log(err, result);
    });
    
        
    
        var query = UGCs.find();
        query.exec(function(err, result){
            for(var i=0 ; i<result.length; i++){

                if(result[i].projectId && result[i].projectId.substring(0,4) =='test'){
                    if(result[i].url.youtube){
                        video_ID = result[i].url.youtube.substring(29,40);
                        console.log(video_ID);
                        youtubeMgr.deleteYoutubeVideo(video_ID, accessToken, function(err, result){
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


};

FM.deleteTestContentMgr.listYoutubeTestVideo = function(){
    var video_ID = null;


    var query = UGCs.find();
    query.exec(function(err, result){
        for(var i=0 ; i<result.length; i++){
            if(i === 0)
                console.log('');

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
            if(i === 0)
                console.log('');
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
                    console.log('successful');
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
            if(i === 0)
                console.log('');

            if(result[i].projectId && result[i].projectId.substring(0,4) =='test'){
                    console.log(result[i]._id+result[i].projectId);
                    count++;
            }
        }
        if(count === 0)
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
        if(count === 0)
            console.log('No Test data!');

    });


};


//FM.deleteTestContentMgr.deleteTestContentController();

module.exports = FM.deleteTestContentMgr;