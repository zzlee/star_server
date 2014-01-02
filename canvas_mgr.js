/**
 * canvas_mgr.js
 * Generate the long photo
 * 
 */

var DEBUG = true,
FM_LOG = (DEBUG) ? function(str){ logger.info( typeof(str)==='string' ? str : JSON.stringify(str) ); } : function(str){} ;

var spawn = require('child_process').spawn;
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var fbReportListener = new EventEmitter();


var canvasMgr = {};

canvasMgr.genDoohPhoto = function(content, genPhoto_cb){
	
};

canvasMgr.genLongPhoto = function(content, genPoto_cb){
	logger.info("[canvasMgr.genLongPhoto]");
	_private.genLongPhoto(content.id, content.fbId, content.projectId, content.template, content.subTemplate, content.file, content.text, genPoto_cb);
};

canvasMgr.genVideo = function(content, genVideo_cb){
	logger.info("[canvasMgr.genVideo]");
	_private.genVideo(content, genVideo_cb);
};

var _private = {
		genDoohPhoto: function(){
			
		},
		
		genLongPhoto: function(Id, fbId, projectId, template, subTemplate, file, text, genLongPhoto_cb){
			logger.info("[_private.genLongPhoto]");
			/*
			http://192.168.5.115/imageUgc.html?id=100004790103783&name=Jeff Chai&projectId=mood-521c19aeb4c146740f000005-20130830T094018567Z&file=_cdv_photo_016.jpg&template=cultural_and_creative&subTemplate=picture_only&word=test
			*/
			var imageUgcUrl = 'http://127.0.0.1/demo/imageUgc.html';
			 var chrome = spawn('chrome.exe', 
                     [imageUgcUrl + 
                     '?id=' + Id +
                     '&fbId=' + fbId +
                     '&template=' + template +
                     '&projectId=' + projectId + 
                     '&file=' + file +
                     '&subTemplate=' + subTemplate +
                     '&text=' + text]);
		        chrome.stdout.on('data', function (data) {   FM_LOG('[_private.genLongPhoto] stdout: ' + data);   });
		        chrome.stderr.on('data', function (data) {	 FM_LOG('[_private.genLongPhoto] stderr: ' + data);  });
		        chrome.on('close', function (code) {
		        	if(code != 0)
		        		FM_LOG('[_private.genLongPhoto] child process exited with code ' + code);
		        	genLongPhoto_cb(null, 'done');
		        });
			
		},
		
		
		genVideo: function(fbID, genVideo_cb){
			logger.info("[_private.genVideo]");
			var videoUgcUrl = "http://127.0.0.1/videoUgc.html";
			var chrome = spawn('chrome.exe',
					[videoUgcUrl +
					 '?id=' + fbID]);
	        chrome.stdout.on('data', function (data) {   FM_LOG('[_private.genVideo] stdout: ' + data);   });
	        chrome.stderr.on('data', function (data) {	 FM_LOG('[_private.genVideo] stderr: ' + data);  });
	        chrome.on('close', function (code) {
	        	if(code != 0)
	        		FM_LOG('[_private.genVideo] child process exited with code ' + code);
	        	genVideo_cb(null, 'Chrome done');
	        });
		}
};


module.exports = canvasMgr;


