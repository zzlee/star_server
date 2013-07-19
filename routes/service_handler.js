var path = require('path');
var workingPath = process.cwd();

var admin_mgr = require("../admin.js"),
    service_mgr = require("../service_mgr.js"),
    tokenMgr = require("../token_mgr.js");

var FMDB = require('../db.js');


var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ logger.info( typeof(str)==='string' ? str : JSON.stringify(str) ); } : function(str){} ;
    
var FM = { service: {} };

FM.service.get_cb = function(req, res){
    
    FM_LOG("[service.get_cb]");
    var loginHtml = path.join(workingPath, 'public/admin_login.html');
    var mainAdminPageHtml = path.join(workingPath, 'public/service_frame.html');
    
    if (!req.session.admin_user) {
        res.sendfile(loginHtml);
    }
    else{
        res.sendfile(mainAdminPageHtml);
    }
    
};

FM.service.getCustomerServiceItems_get_cb = function(req, res){
    console.log('getCustomerServiceItems_get_cb');
    
    var _id;
    var condition;
    var field;
    var type = req.query.type;
    console.log('type'+type);
    
    service_mgr.getCustomerService(_id, condition, field, function(err, result){
        if(!err){
          console.log(result);
//          res.send(200, {message: type});
          if(type == 'table')
          res.render( 'table_service', {serviceQuestionList: result} );
          if(type == 'list')
          res.render( 'list_service', {serviceQuestionList: result} );
          }
        else
          console.log(err);
        });
//  var testArray =
//  [
//   {
//  userName: 'kaiser tsai', //影片編號
//  phoneVersion: '0.0.1', //FB讚次數
//  createdOn: '2013/07/18' //觀看次數
//  }
//  ];
//  res.render( 'service', {serviceQuestionList: testArray} );
};

FM.service.createCustomerServiceItems_get_cb = function(req, res){
    var vjson = {
            ownerId : {_id : memberId},
            genre : req.query.phoneVersion,
            phoneVersion : req.query.phoneVersion,
            content: { question : req.query.question}
            };
    console.log('createCustomerServiceItems_get_cb');
    service_mgr.createCustomerServiceItem(vjson, function(err, result){
        if(!err){
            console.log('createItems'+result);
            }
          else
            console.log('createItems'+err);
          });

};


module.exports = FM.service;