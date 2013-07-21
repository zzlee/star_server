/**
 * @fileoverview Implementation of serviceMgr
 */

var db = require('./db.js');
var async = require('async');

var customerServiceItemModel = db.getDocModel("customerServiceItem");
var memberModel = db.getDocModel("member");

/**
 * The manager who handles the customer service
 *
 * @mixin
 */
var serviceMgr = {};

/**
 * add new customer question to feltmeng db.<br>
 * <br>
 * @param {String} fb_id The ID of the FB.
 * 
 * @param {String} question The user have some question about our product.
 * 
 * @param {Function} cb The callback function called when the question add to DB.<br>
 *     The function signature is cb(err, status) :
 *     <ul>
 *     <li>status: A string specifying status which the question of the user is added to the DB 
 *             after adding.      
 *     <li>err: error message if any error happens
 *     </ul>
 */
serviceMgr.createCustomerServiceItem = function(vjson, cb ){

//    var arr = [question];
//    arr.push(question);
//    var questiona = [{question :'I cannot sign in the app What can I do?'}];
    console.log('+++'+JSON.stringify(vjson));
//    var field = 'fb fb.userName fb.userID';
    var field;
    db.listOfdocModels( memberModel, {_id: vjson.ownerId}, field, null, function(err, result){
        if(!err){
            console.log('---'+result[0].fb.userID);
            newVjson = {
                    ownerId: vjson._id,
                    genre: vjson.genre,
                    phoneVersion: vjson.phoneVersion,
                    question: vjson.question,
                    fb_userName: result[0].fb.userName,
                    fb_id: result[0].fb.userID
            };
            db.createAdoc(customerServiceItemModel , newVjson, function(err,result){
                cb(err, result); 
            });
        }
        else cb(err, result); 
    });

    
};
//test
//var fb_id = '33456';
//var question_1 = {question:'no respond'};
//var question_2 = {question:'bug'};
//var question = [question_1, question_2];
var vjson = {
        ownerId : '51d38ca086fa21440a000002',
        genre : 'publish',
        phoneVersion : 'iPhone 6.0.1',
        question : 'zzz'
        };
//serviceMgr.createCustomerServiceItem(vjson, function(err, result){
//    if(!err)
//        console.log(result);
//    else
//        console.log(err);
//});

/**
 * update field to feltmeng db.<br>
 * <br>
 * @param {String} fb_id The ID of the FB.
 * 
 * @param {Number} no The no. whose question are to be added.
 * 
 * @param {Object} vjson DB field's value likes genre='account'.  
 * 
 * @param {Function} cb The callback function called when the value update to DB.<br>
 *     The function signature is cb(err, status) :
 *     <ul>
 *     <li>status: A string specifying status which the field is updated to the DB 
 *             after updating. 
 *     <li>err: error message if any error happens
 *     </ul>
 */
serviceMgr.updateCustomerServiceItem = function(_id, vjson, cb ){
    
    db.updateAdoc(customerServiceItemModel,_id, vjson, function(err, result){
        cb(err, result); 
    });
    
};
//test
var _id = '51e63c7f8614786018000003';
var date = new Date();
var question_1 = {question:'I cannot sign in the app What can I do?',
                  questionTime:date,
                  answer:'ok',
                  answerTime:date};
var question_2 = {question:'I get error message',
                  questionTime:date};
var question_3 = {question:'no~~~~~',
                  questionTime:date};
var answer_1 ={answer:'ok'};
var question = [question_1, question_2, question_3];
var vjson = {
        content: question
        };
//serviceMgr.updateCustomerQuestion(_id, vjson, function(err, result){
//    if(!err)
//        console.log(result);
//    else
//        console.log(err);
//});

/**
 * get customer question and answer from feltmeng db.<br>
 * <br>
 * @param {String} fb_id The ID of the FB.
 * 
 * @param {Number} no The no. whose question are to be added.
 * 
 * @param {Function} cb The callback function called when get customer question from DB.<br>
 *     The function signature is cb(err, result) :
 *     <ul>
 *     <li>result:customer question and answser from DB
 *     <li>err: error message if any error happens
 *     </ul>
 */
serviceMgr.getCustomerServiceItem= function(_id, condition, field, pageLimit, pageSkip, cb ){
    
    
//    db.listOfdocModels( customerServiceItemModel, condition, field, {sort :'no', limit: pageLimit , skip: pageSkip}, function(err, result){
    db.listOfdocModels( customerServiceItemModel, condition, field, {sort :'no'}, function(err, result){
        cb(err, result); 
    });
    
};
var condition = { 'ownerId._id': '51d38ca086fa21440a000002'};
//var field = 'content';
var field;
var field2 = 'fb_id no genre reply version';
var pageLimit;
var pageSkip;

//serviceMgr.getCustomerService(_id, condition, field, pageLimit, pageSkip, function(err, result){
//if(!err)
//  console.log('------------'+result);
//else
//  console.log(err);
//});
/**
 * get customer service list from feltmeng db.<br>
 * <br>
 * @param {String} fb_id The ID of the FB.(null will select all customer question)
 * 
 * @param {Function} cb The callback function called when get customer question list from DB.<br>
 *     The function signature is cb(err, result) :
 *     <ul>
 *     <li>result:customer service list from DB
 *     <li>err: error message if any error happens
 *     </ul>
 */
serviceMgr.getCustomerServiceList = function(fb_id, cb ){
    
};

//TODO admin and message count


module.exports = serviceMgr;