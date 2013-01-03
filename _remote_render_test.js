
setTimeout(function(){ 

var aeServerMgr = require('./ae_server_manager.js' );

aeServerMgr.createMovie('http://localhost','greeting-50c85019e6b209a80f000004-20121213T015823474Z', '1224', '1234', 'test');

}, 10);