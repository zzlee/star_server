
var censorMgr = {};

var fb_handler = require('./fb_handler.js');
var FMDB = require('./db.js');
var UGCs = FMDB.getDocModel("ugc");


/**
 * @param  request  {json}condition
 *                  (json}sort
 * 
 *         query    {number}createdOn
 *                  {string}rating
 *                  {number}doohPlayedTimes     
 *                  
 * @return response json{userContent(photo url or userContent link in s3),
 *                       FB_ID,
 *                       title,
 *                       description,
 *                       createdOn,
 *                       rating(Range A~E),
 *                       doohPlayedTimes}
 */
censorMgr.getUGCList = function(condition,sort,get_cb){   

    FMDB.listOfdocModels( UGCs,condition,'fb.userName fb.userID _id title description createdOn rating doohPlayedTimes', sort, function(err, result){
        if(err) {logger.error('[db.listOfUGCs]', err);
            get_cb(err,null);
        }
        if(result){
            limit = result.length;
            mappingUserProfilePicture(result,limit,function(err,res){
                if(err) {
                    get_cb(err,null);
                    console.log("mappingUserProfilePicture_err="+err);
                }
                if(result){
//                    
//                    console.log("getUGCList_limit"+limit);
//                    
//                    console.log("query"+result);
//                    console.log("----------------------------------------");
                    get_cb(null,result);
                } 

            });
            //test
        }
    });


    //test
//    var vjson = {
//            rating : 'a',
//            description: 'test_7',
//            doohPlayedTimes:5    
//    };
//    FMDB.createAdoc(UGCs,vjson, function(err, result){
//        if(err)  console.log("createAdoc_err"+err);
//        if(result) console.log("createAdoc_res"+result);
//    });
     

};//getUGCList end


//kaiser test
var condition;
var sort;
var start = new Date('May 01, 2013');
var end = new Date('Jun 27, 2013');
var doohPlayedTimes = 0;
var rating = '';

condition = {'createdOn': {$gte: 'May 01, 2013', $lt: 'Jun 27, 2013'},
//'doohPlayedTimes':doohPlayedTimes,
//'rating':rating
};
sort = {sort:{rating:1,
              doohPlayedTimes:-1,
              description:-1
              }
};

censorMgr.getUGCList(condition,sort,function(err,res){
    if(err) console.log("getUGCList_err="+err);
    else console.log("getUGCList="+res);

});


/**
 * @param  request  {string}dooh_ID
 * 
 *         query    
 *                  
 * @return response json{startDate,
 *                       endDate,
 *                       sequence,
 *                       uratio}
 * 
 */
var getTimeslots = function(get_cb){

};


/**
 * @param  request  {string}FB_ID
 * 
 *         query    
 *                  
 * @return response json{FBProfilePicture(link)}
 *                       
 */

var mappingUserProfilePicture = function(data,limit,get_cb){
//    
//    var UGCList = [];
//
//    var UGCListInfo = function(userContent, FB_ID, title, description, rating, doohPlayedTimes, arr) {
//        arr.push({ 
//            userContent: userContent,
//            FB_ID: FB_ID,
//            title: title,
//            description: description,
//            rating: rating,
//            doohPlayedTimes:doohPlayedTimes 
//        });
//    };
//    console.log('map'+limit);
//
//    for(next = 0; next < limit; next++){
//        var fb_id = '100005962359785';
//
//        getUserContent(fb_id,function(err, result){
//            console.log('++++++++'+result);
//            if(err) {logger.error('[mappingUserProfilePicture.getUserContent]', err);
//            get_cb(err,null);
//            }
//            if(result){
//                UGCListInfo(result,data[next].fb_id,data[next].title,data[next].description,data[next].rating,data[next].doohPlayedTimes,UGCList);
//                get_cb(null,UGCList);
//            }
//        }); 
//
//    }

};


var getUserContent = function(fb_id,get_cb){

    fb_handler.getUserProfilePicture(fb_id,function(err, result){
        if(err){
//            get_cb(JSON.stringify(err),null);
            console.log('getUserContent_err'+err);
            get_cb(err,null);
        }
        else{
            console.log(JSON.stringify(result.picture.data.url));
//            get_cb(null,JSON.stringify(result));
            get_cb(null,JSON.stringify(result.picture.data.url));
        }
    });

};
//kaiser test
//var fb_id = '100005962359785';
//getUserContent(fb_id,function(err,res){
//    if(err) console.log("getUserContent_err="+err);
//    else console.log("getUserContent="+res);
//
//});

/**
 * @param  request  {string}_id
 * 
 *         body     {string}UGCLevel(Range A~E)    
 *                  
 * @return response {string}status 
 *                       
 */
var setUGCAttribute = function(_id,vjson,get_cb){

    FMDB.updateAdoc(UGCs,_id,vjson, function(err, result){
        if(err) {logger.error('[db.updateAdoc]', err);
          get_cb(err,null);
        }
        if(result){
          get_cb(null,result.rating);
        }
    });
};

//kaiser test
var vjson = {
        rating : 'd',
};
var _id = '51c939f65fcfaf8823000002';
setUGCAttribute(_id,vjson,function(err,res){
    if(err) console.log("setUGCAttribute_err"+err);
    else console.log("setUGCAttribute_change="+res);

});


module.exports = censorMgr;