
var FM = { censor_handler: {} };

var censor_mgr = require("../censor_mgr.js");
//FM.censor.userContentItems_get_cb = function(req, res){
//    
//};
//
//
//FM.censor.timeslots_get_cb = function(req, res){
//};

console.log("censor_mgr");


FM.censor_handler.getUGCList_get_cb = function(req,res){
    console.log("censor_mgr");
 };

module.exports = FM.censor_handler;