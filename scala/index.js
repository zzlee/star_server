/**
 * Login to server and get module function.
 * 
 * @constructor
 * @param {string} url The server URL.
 * @param {string} username The account to login.
 * @param {string} password The password to login.
 * @return {function} listTimeslot List timeslots from server.
 * @return {function} setItemToEvent Set item in timeslot to server.
**/

var scalaMgr = require('./connect.js');

scalaMgr.connectServer({
    url: 'http://server-pc:8080',
    username: 'administrator',
    password: '53768608'
});

/**
 * List timeslots from server.
 * 
 * @param {string} startDate The start date.
 * @param {string} endDate The end date.
 * @return {json} timeslot_cb Report timeslot list.
**/
scalaMgr.listTimeslot(startDate, endDate, timeslot_cb);

/**
 * Set item in timeslot to server.
 * 
 * @param {string} item The item upload to scala server.
 * @param {string} timeslotId The id in specific timeslot.
 * @return {json} reportStatus_cb Report status.
**/
scalaMgr.setItemToEvent(item, timeslotId, reportStatus_cb);