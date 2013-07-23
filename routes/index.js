//GZ  
var movieTemplate = require('./movie_template.js'); 
exports.getTemplateList_cb = movieTemplate.getTemplateList_cb;
exports.getTemplateDescription_cb = movieTemplate.getTemplateDescription_cb;
exports.getTemplateCustomizableObjectList_cb = movieTemplate.getTemplateCustomizableObjectList_cb;

var youtube = require('./yt_oauth2_handler.js');
exports.YoutubeOAuth2_cb = youtube.YoutubeOAuth2_cb;

var userContentHandler = require('./user_content_handler.js');
exports.uploadUserContentFile_cb = userContentHandler.uploadUserContentFile_cb;
exports.uploadUserDataInfo_cb = userContentHandler.uploadUserDataInfo_cb;

var connectionHandler = require('./connection_handler.js');
exports.commandResponse_post_cb = connectionHandler.commandResponse_post_cb;
exports.command_get_cb = connectionHandler.command_get_cb;

var storyCamControllerHandler = require('./story_cam_controller_handler.js');
exports.storyCamControllerHandler = storyCamControllerHandler;

var authorizationHandler = require('./authorization_handler.js');
exports.authorizationHandler = authorizationHandler;

var miixHandler = require('./miix_handler.js');
exports.miixHandler = miixHandler;

//JF
var doohHandler = require('./dooh_handler.js');
exports.doohHandler = doohHandler;

//Kaiser
var censorHandler = require('./censor_handler.js');
exports.censorHandler = censorHandler;

var service_handler = require('./service_handler.js');
exports.service = service_handler;

//GL
var member_handler = require("../member.js"),
    api = require("./api.js"),
    admin_handler = require("./admin_handler.js");
exports.api = api;
exports.admin = admin_handler;
exports.member = member_handler;

//DEPRECATED
//DEPRECATED


//DEPRECATED
//DEPRECATED
//DEPRECATED
//DEPRECATED
//DEPRECATED
//DEPRECATED
//DEPRECATED



