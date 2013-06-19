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

var scalaMgr = require('./connect_t.js');

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
 * @param {function} timeslot_cb Report timeslot list in json.
 *     @param {string} id The time slot id. i.e. 20130618_14_3, ymd_hours_times
 *     @param {string} startTime The start time.
 *     @param {string} playlistName The playlistName for timeslots.
 *     @param {boolean} valid The valid show this timeslot is valid.
**/
//scalaMgr.listTimeslot(startDate, endDate, timeslot_cb);

/**
 * Set item in timeslot to server.
 * 
 * @param {object} item The item upload to scala server.
 *     @param {string} path The path is file path.
 *     @param {string} filename The filename is file title.
 * @param {string} timeslotId The id in specific timeslot.
 * @param {function} reportStatus_cb Report status. i.e. { value: success }
**/
//scalaMgr.setItemToEvent(item, timeslotId, reportStatus_cb);