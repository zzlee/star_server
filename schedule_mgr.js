/**
 * @fileoverview Implementation of scheduleMgr
 */


/**
 * The manager who handles the scheduling of playing UGC on DOOHs
 *
 * @mixin
 */
var scheduleMgr = {};


/**
 * Automatically selects applied UGC items (based on a predefined rule) and put them
 * in "to-be-played" list for a specific DOOH
 * 
 * @param {Number} dooh The ID of the DOOH upon which the selected UGCs are played
 * 
 * @param {Object} intervalOfSelectingUGC An object specifying the starting and ending of  
 *     of the time interval for scheduleMgr to select the applied UGC items <br>
 *     <ul>
 *     <li>start: Date()-readable string specifying the start of the interval
 *     <li>end: Date()-readable string specifying the end of the interval
 *     </ul>
 *     For example, {start: '2013/6/21 8:30', end: '2013/6/21 13:00'} 
 *
 * @param {Object} intervalOfDoohProgrames An object specifying the starting and ending of  
 *     of the time interval which the generated schedule covers   
 *     <ul>
 *     <li>start: Date()-readable string specifying the start of the interval
 *     <li>end: Date()-readable string specifying the end of the interval
 *     </ul>
 *     For example, {start: '2013/6/22 8:30', end: '2013/6/22 13:00'} 
 * 
 * @param {Function} created_cb The callback function called when the result program list is created.<br>
 *     The function signature is created_cb(resultProgramList, err) :
 *     <ul>
 *     <li>resultProgramList: An array of objects containing program info:
 *         <ul>
 *         <li>_id: A number specifying the ID of a program item  
 *         <li>interval: An object specifying the starting and ending time of the program item
 *             <ul>
 *             <li>start: Date()-readable string specifying the start of the interval
 *             <li>end: Date()-readable string specifying the end of the interval
 *             </ul>
 *         <li>ugc: A number specifying the ID of the UGC contained in this program. (This is
 *             actually the id of items store in ugc collection.) 
 *         </ul>
 *         For example, <br>
 *         [{_id:43524, interval:{start:'2013/6/22 8:30:00', end:'2013/6/22 8:30:30'}, ugc:48593},<br>
 *          {_id:43525, interval:{start:'2013/6/22 8:30:00', end:'2013/6/22 8:30:30'}, ugc:48353},<br>
 *          {_id:43544, interval:{start:'2013/6/22 8:30:00', end:'2013/6/22 8:30:30'}, ugc:43593}]
 *         
 *     <li>err: error message if any error happens
 *     </ul>
 */
scheduleMgr.createProgramList = function(dooh, intervalOfSelectingUGC, intervalOfDoohProgrames, cb ){
    
};



scheduleMgr.updateProgramList = function(dooh, intervalOfDoohProgrames, cb ){
    
};


module.exports = scheduleMgr;