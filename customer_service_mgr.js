/**
 * @fileoverview Implementation of customerServiceMgr
 */

var db = require('./db.js');
var async = require('async');

var programTimeSlotModel = db.getDocModel("programTimeSlot");

/**
 * The manager who handles the customer service
 *
 * @mixin
 */
var customerServiceMgr = {};

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
customerServiceMgr.addCustomerQuestion = function(fb_id, question, cb ){
    
};
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
customerServiceMgr.updateCustomerQuestion = function(fb_id, no, vjson, cb ){
    
};
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
customerServiceMgr.getCustomerService= function(fb_id, no, cb ){
    
};
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
customerServiceMgr.getCustomerServiceList = function(fb_id, cb ){
    
};




module.exports = customerServiceMgr;