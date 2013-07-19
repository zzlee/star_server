/**
 * @fileoverview Implementation of serviceMgr
 */

var db = require('./db.js');
var async = require('async');

var customerServiceSlotModel = db.getDocModel("customerServiceItem");

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


    db.createAdoc(customerServiceSlotModel , vjson, function(err,result){
        cb(err, result); 
    });
    
};
//test
//var fb_id = '33456';
//var question_1 = {question:'no respond'};
//var question_2 = {question:'bug'};
//var question = [question_1, question_2];
//var vjson = {
//        fb_id : fb_id,
//        no : 2,
//        genre : {type:'account'},
//        reply : {type: false},
//        version : 'iPhone 6.0.1',
//        content: question
//        };
//serviceMgr.addCustomerQuestion(fb_id, vjson, function(err, result){
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
serviceMgr.updateCustomerQuestion = function(_id, vjson, cb ){
    
    db.updateAdoc(customerServiceSlotModel,_id, vjson, function(err, result){
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
serviceMgr.getCustomerService= function(_id, condition, field, cb ){
    
    
    db.listOfdocModels( customerServiceSlotModel, condition, field, {sort :'no'}, function(err, result){
        cb(err, result); 
    });
    
};
var condition = {'no':1};
var field = 'content';
var field2 = 'fb_id no genre reply version';

//serviceMgr.getCustomerService(_id, condition, field2, function(err, result){
//if(!err)
//  console.log(result);
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




module.exports = serviceMgr;