var path = require('path');
var workingPath = process.cwd();

var admin_mgr = require("../admin.js"),
    service_mgr = require("../service_mgr.js"),
    tokenMgr = require("../token_mgr.js");

var FMDB = require('../db.js'),
  UGCs = FMDB.getDocModel("ugc"),
  members = FMDB.getDocModel("member"),
    memberListInfos = FMDB.getDocModel("memberListInfo"),
  miix_content_mgr = require('../miix_content_mgr.js');

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


module.exports = FM.service;