/**
 * @fileoverview Implementation of scheduleMgr
 */

var db = require('./db.js');
var async = require('async');
var mongoose = require('mongoose');

var programTimeSlotModel = db.getDocModel("programTimeSlot");
var ugcModel = db.getDocModel("ugc");
var candidateUgcCacheModel = db.getDocModel("candidateUgcCache");

/**
 * The manager who handles the scheduling of playing UGC on DOOHs
 *
 * @mixin
 */
var scheduleMgr = {};

var DEFAULT_PROGRAM_PERIOD = 10*60*1000; //10 min
var TIME_INTERVAL_RANKIGN = [{startHour: 17, endHour: 23},  //start with the time interval with highest ranking
                             {startHour: 8, endHour: 16},
                             {startHour: 0, endHour: 7}];
var censorMgr = null;

var programPlanningPattern =(function(){    
    var i = -1;
    var DEFAULT_PROGRAM_SEQUENCE = [ "miix", "cultural_and_creative", "mood", "check_in" ]; 
    var programSequence = DEFAULT_PROGRAM_SEQUENCE;
    
    return {
        getProgramGenreToPlan: function(){
            i++;
            if (i >= programSequence.length){
                i = 0;
            }
            return programSequence[i];
        },
        
        reset: function(){
            i = -1;
        },
        
        set: function(_programSequence){
            programSequence = _programSequence;
        }
    };
})();


var paddingContent =(function(){ 
    var PADDING_CONTENT_TABLE = {
            miix: [{dir: "content/padding_content", file:"miix01.jpg", format:"image"},
                   {dir: "content/padding_content", file:"miix02.jpg", format:"image"}],
            cultural_and_creative: [{dir: "content/padding_content", file:"cc01.jpg", format:"image"},
                                    {dir: "content/padding_content", file:"cc02.jpg", format:"image"},
                                    {dir: "content/padding_content", file:"cc03.jpg", format:"image"},
                                    {dir: "content/padding_content", file:"cc04.jpg", format:"image"}
                                    ],
            mood: [{dir: "content/padding_content", file:"mood01.jpg", format:"image"},
                   {dir: "content/padding_content", file:"mood02.jpg", format:"image"},
                   {dir: "content/padding_content", file:"mood03.jpg", format:"image"},
                   {dir: "content/padding_content", file:"mood04.jpg", format:"image"}
                   ],
            check_in: [{dir: "content/padding_content", file:"check_in01.jpg", format:"image"},
                       {dir: "content/padding_content", file:"check_in02.jpg", format:"image"},
                       {dir: "content/padding_content", file:"check_in03.jpg", format:"image"},
                       {dir: "content/padding_content", file:"check_in04.jpg", format:"image"}
                       ]                                
    };
        
    return {
        get: function(id, cb){
            var idArray = id.split('-');
            var contentGenre = idArray[0]; 
            var index = idArray[1];
            if (cb){
                cb(null, PADDING_CONTENT_TABLE[contentGenre][index]);
            } 
        }
    };
})();
        
//for test
var censorMgr_getUGCList_fake = function(interval, get_cb){
    /*
    var result = [];
    for (var i=0;i<300;i++){
        result[i] = {id: i};
    }
    */
    var result = [ {_id: "1", contentGenre: "miix"},
                   {_id: "2", contentGenre: "cultural_and_creative"},
                   {_id: "3", contentGenre: "check_in"},
                   {_id: "4", contentGenre: "miix"},
                   {_id: "5", contentGenre: "check_in"},
                   {_id: "6", contentGenre: "check_in"},
                   {_id: "7", contentGenre: "miix"},
                   {_id: "8", contentGenre: "check_in"},
                   {_id: "9", contentGenre: "miix"},
                   {_id: "10", contentGenre: "cultural_and_creative"},
                   {_id: "11", contentGenre: "miix"},
                   {_id: "12", contentGenre: "check_in"},
                   {_id: "13", contentGenre: "mood"},
                   {_id: "14", contentGenre: "cultural_and_creative"},
                   {_id: "15", contentGenre: "miix"},
                   {_id: "16", contentGenre: "mood"},
                   {_id: "17", contentGenre: "check_in"},
                   {_id: "18", contentGenre: "check_in"},
                   {_id: "19", contentGenre: "miix"},
                   {_id: "20", contentGenre: "cultural_and_creative"},
                   {_id: "21", contentGenre: "miix"},
                   {_id: "22", contentGenre: "check_in"},
                   {_id: "23", contentGenre: "cultural_and_creative"},
                   {_id: "24", contentGenre: "mood"},
                   {_id: "25", contentGenre: "mood"},
                   {_id: "26", contentGenre: "miix"},
                   {_id: "27", contentGenre: "cultural_and_creative"},
                   {_id: "28", contentGenre: "miix"},
                   {_id: "29", contentGenre: "check_in"},
                   {_id: "30", contentGenre: "miix"},
                   {_id: "31", contentGenre: "miix"},
                   {_id: "32", contentGenre: "check_in"},
                   {_id: "33", contentGenre: "mood"},
                   {_id: "34", contentGenre: "cultural_and_creative"},
                   {_id: "35", contentGenre: "miix"},
                   {_id: "36", contentGenre: "mood"},
                   {_id: "37", contentGenre: "check_in"},
                   {_id: "38", contentGenre: "check_in"},
                   {_id: "39", contentGenre: "mood"},
                   {_id: "40", contentGenre: "mood"},
                   {_id: "41", contentGenre: "miix"},
                   {_id: "42", contentGenre: "check_in"},
                   {_id: "43", contentGenre: "mood"},
                   {_id: "44", contentGenre: "check_in"},
                   {_id: "45", contentGenre: "mood"},
                   {_id: "46", contentGenre: "miix"},
                   {_id: "47", contentGenre: "check_in"},
                   {_id: "48", contentGenre: "miix"},
                   {_id: "49", contentGenre: "check_in"},
                   {_id: "50", contentGenre: "miix"},
                   
                   ];
    
    get_cb(null, result);
    
};

//for test
var scalaMgr_listAvailableTimeInterval = function(interval, list_cb){
    var result = [{interval:{start:(new Date("2013/5/5 7:30:20")).getTime(), end:(new Date("2013/5/5 8:30:20")).getTime()},cycleDuration: 5*60*1000},
                  {interval:{start:(new Date("2013/5/5 13:00:00")).getTime(), end:(new Date("2013/5/5 13:30:00")).getTime()},cycleDuration: 5*60*1000},
                  {interval:{start:(new Date("2013/5/5 19:00:00")).getTime(), end:(new Date("2013/5/5 19:40:00")).getTime()},cycleDuration: 5*60*1000}
                  ];
    list_cb(null, result );
};

/**
 * Initialize scheduleMgr
 * 
 * @param {Object} _censorMgr A reference to object instance of censerMgr
 */
scheduleMgr.init = function(_censorMgr){
    censorMgr = _censorMgr;
};

/**
 * Automatically selects applied UGC items (based on a predefined rule) and put them
 * in "to-be-played" list for a specific DOOH.<br>
 * <br>
 * This method will first ask ScalaMgr about the available time intervals in which Miix system
 * can play its UGC content.  It will then generate time slots base on a specific rule, and then 
 * fill them by picking up UGC items from a sorted list generated from censerMgr.
 * 
 * @param {String} dooh The ID of the DOOH upon which the selected UGCs are played
 * 
 * @param {Object} intervalOfSelectingUGC An object specifying the starting and ending of  
 *     of the time interval for scheduleMgr to select the applied UGC items <br>
 *     <ul>
 *     <li>start: the start of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *     <li>end: the end of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *     </ul>
 *     For example, {start: 1371861000000, end: 1371862000000} 
 *
 * @param {Object} intervalOfPlanningDoohProgrames An object specifying the starting and ending of  
 *     of the time interval which the generated schedule covers   
 *     <ul>
 *     <li>start: the start of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *     <li>end: the end of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *     </ul>
 *     For example, {start: 1371861000000, end: 1371862000000} 
 * 
 * @param {Array} programSequence An array of strings showing the sequence of program genres to use when 
 *     when the system is planning the program(s) of a "micro time interval" <br>
 *     Note: the string must be "miix", "cultural_and_creative", "mood", or "check_in"
 *     For example, ["miix", "check_in", "check_in", "mood", "cultural_and_creative" ] <br>
 * 
 * @param {Function} created_cb The callback function called when the result program list is created.<br>
 *     The function signature is created_cb(err, result):
 *     <ul>
 *     <li>err: error message if any error happens
 *     <li>result: object containing the following information:
 *         <ul>
 *         <li>numberOfProgramTimeSlots: number of program time slots created 
 *         <li>sessionId: id indicating this session of creating program time slots (This will be used when   
 *         calling scheduleMgr.removeUgcfromProgramAndAutoSetNewOne()
 *         </ul>
 *         For example, <br>
 *         { numberOfProgramTimeSlots: 33, sessionId: '1367596800000-1367683140000-1373332978201' }     
 *     </ul>
 */
scheduleMgr.createProgramList = function(dooh, intervalOfSelectingUGC, intervalOfPlanningDoohProgrames, programSequence, created_cb ){
    
    var sortedUgcList = null;
    
    var putUgcIntoTimeSlots = function(finishPut_cb){
        
        var candidateUgcList = sortedUgcList.slice(0); //clone the full array of sortedUgcList
        var counter = 0;
        
        var saveCandidateUgcList = function(_candidateUgcList, _intervalOfSelectingUGC, saved_cb){
            var sessionId = _intervalOfSelectingUGC.start.toString() + '-' + _intervalOfSelectingUGC.end.toString() + '-' + Number((new Date()).getTime().toString());
            var indexArrayCandidateUgcCache = []; for (var i = 0; i < _candidateUgcList.length; i++) { indexArrayCandidateUgcCache.push(i); }
            
            var iteratorCreateCandidateUgcCache = function(indexOfCandidateUgcCache, interationDone_createCandidateUgcCache_cb){
                var CandidateUgcCache = db.getDocModel("candidateUgcCache");
                var aCandidateUgcCache = new CandidateUgcCache();
                aCandidateUgcCache.sessionId = sessionId;
                aCandidateUgcCache.index = indexOfCandidateUgcCache;
                var _candidateUgc = JSON.parse(JSON.stringify( _candidateUgcList[indexOfCandidateUgcCache] )); //clone candidateUgc object to prevent from strange error "RangeError: Maximum call stack size exceeded"
                aCandidateUgcCache.candidateUgc = _candidateUgc;
                aCandidateUgcCache.markModified('candidateUgc');
                aCandidateUgcCache.save(function(err1, aSavedCandidateUgcCache){     
                    interationDone_createCandidateUgcCache_cb(err1, aSavedCandidateUgcCache);
                });                
            };
            async.mapSeries(indexArrayCandidateUgcCache, iteratorCreateCandidateUgcCache, function(err, savedCandidateUgcCacheList){
                if (!err){
                    var result = { sessionId: sessionId, candidateUgcCacheList: savedCandidateUgcCacheList };
                    saved_cb(null, result);
                }
                else {
                    saved_cb("Failed to save candidate UGC cached list: "+err, null);
                }
            });
            
        };
        
        //== PutUgcIntoTimeSlots_eachRankedTimeIntervalInADay
        var iteratorPutUgcIntoTimeSlots_eachRankedTimeIntervalInADay = function(aTimeIntervalInADay, interationDone_cb1){
            //query the time slots (in programTimeSlot collection) belonging to this interval and put UGC to them one by one
            //console.log("aTimeIntervalInADay=");
            //console.dir(aTimeIntervalInADay);
            programTimeSlotModel.find({ "timeslot.startHour": {$lte:aTimeIntervalInADay.endHour, $gte:aTimeIntervalInADay.startHour}, "type": "UGC", "dooh": dooh }).sort({timeStamp:1}).exec(function (_err_1, timeSlots) {
                
                if (!_err_1){
                    
                    //console.log("timeSlots=");
                    //console.dir(timeSlots);   
                    //-- PutUgcIntoTimeSlots_eachTimeSlot
                    var iteratorPutUgcIntoTimeSlots_eachTimeSlot = function(aTimeSlot, interationDone_cb2){
                        
                        var selectedUgc = null;
                        
                        //pick up one UGC from the sorted list 
                        for (var indexOfcandidateToSelect=0; indexOfcandidateToSelect<=candidateUgcList.length; indexOfcandidateToSelect++){
                            
                            if (indexOfcandidateToSelect == candidateUgcList.length){
                                candidateUgcList = candidateUgcList.concat(sortedUgcList);
                            }
                            
                            if ( candidateUgcList[indexOfcandidateToSelect].contentGenre == aTimeSlot.contentGenre){
                                selectedUgc = candidateUgcList.splice(indexOfcandidateToSelect, 1)[0];
                                break;
                            }
                        }
                        
                        var _selectedUgc = JSON.parse(JSON.stringify(selectedUgc)); //clone selectedUgc object to prevent from a strange error "RangeError: Maximum call stack size exceeded"
                        
                        db.updateAdoc(programTimeSlotModel, aTimeSlot._id, {"content": _selectedUgc }, function(_err_2, result){
                            counter++;
                            //console.dir(result);
                            interationDone_cb2(_err_2);
                        });
                        
                        
                    };
                    
                    async.eachSeries(timeSlots, iteratorPutUgcIntoTimeSlots_eachTimeSlot, function(_err_3){
                        interationDone_cb1(_err_3);
                    });
                    // -- end of PutUgcIntoTimeSlots_eachTimeSlot
                    
                }
                else{
                    interationDone_cb1(_err_1);
                }
                
                //console.log("timeSlots=");
                //console.dir(timeSlots);
            });
            
            
                
        };
        
        async.eachSeries(TIME_INTERVAL_RANKIGN, iteratorPutUgcIntoTimeSlots_eachRankedTimeIntervalInADay, function(_err_4){
            if (!_err_4) {
                
                var numberOfProgramTimeSlots = counter;
                
                saveCandidateUgcList(candidateUgcList, intervalOfSelectingUGC, function(_err_5, _result_5){
                    //console.log("saveCandidateUgcList() result=");
                    //console.dir(_result_5);                    
                    //console.log("err=%s", _err_5);
                    if (!_err_5){
                        var result = {numberOfProgramTimeSlots: numberOfProgramTimeSlots, sessionId: _result_5.sessionId };
                        if (finishPut_cb){
                            finishPut_cb(null, result);
                        }
                    }
                    else {
                        if (finishPut_cb){
                            finishPut_cb(_err_5, null);
                        }
                    }
                    
                });
                
                
                
            }
            else{
                if (finishPut_cb){
                    finishPut_cb('Failed to add empty program time slots into ranked intervals in a day: '+_err_4, null);
                }
            }
            
        });
        //== end of PutUgcIntoTimeSlots_eachRankedTimeIntervalInADay
        
        
    };  //end of putUgcIntoTimeSlots()
    
    var generateTimeSlot = function( _cb1){
        
         
        var generateTimeSlotsOfMicroInterval = function(interval, generatedTimeSlotsOfMicroInterval_cb){ //Micro interval means a time slot containing purely our programs
            
            var contentGenre = programPlanningPattern.getProgramGenreToPlan(); //the genra that will be uesed in this micro interval
            var numberOfUGC;
            if (contentGenre=="miix"){
                numberOfUGC = 1;
            }
            else{
                numberOfUGC = 3;
            }
            var paddingContents;
            
            var ProgramTimeSlot = programTimeSlotModel;
            var vjsonDefault = {
                    dooh: dooh,
                    timeslot: {
                        start: interval.start, 
                        end: interval.end,
                        startHour: (new Date(interval.start)).getHours()},
                    //content: {ugcId:"12345676", ugcProjcetId:"3142462123"}
                    contentGenre: contentGenre
                    };
            
            var timeStampIndex = 0;
            
            var pad = function(n, width, z) { //function for padding the number ns with character z 
                z = z || '0';
                n = n + '';
                return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
            };
            
            async.series([
                          function(callback1){
                              // get all the padding contents
                              var indexArrayPaddingContents = []; for (var i = 0; i < numberOfUGC+1; i++) { indexArrayPaddingContents.push(i); }
                              
                              var iteratorGetPaddingContents = function(indexOfPaddingContents, interationDone_getPaddingContents_cb){
                                  paddingContent.get(contentGenre+'-'+indexOfPaddingContents , function(err_get, paddingContent){
                                      interationDone_getPaddingContents_cb(err_get, paddingContent);
                                  });
                              };
                              async.mapSeries(indexArrayPaddingContents, iteratorGetPaddingContents, function(err, results){
                                  paddingContents = results;
                                  //console.log('paddingContents=');
                                  //console.dir(paddingContents);
                                  callback1(null);
                              });
                              
                          },
                          function(callback2){
                              // put padding program 0
                              var aProgramTimeSlot = new ProgramTimeSlot(vjsonDefault);
                              aProgramTimeSlot.content = paddingContents[0];
                              aProgramTimeSlot.timeStamp = interval.start + '-' + pad(timeStampIndex, 3);
                              timeStampIndex++;
                              aProgramTimeSlot.markModified('content');
                              aProgramTimeSlot.save(function(err1, _result){     
                                  //if (err1) console.log("err1="+err1);
                                  callback2(err1);
                              });
                          },
                          function(callback3){
                              // put following programs: UGC 0, padding 1, UGC 1, padding 2, .....
                              var indexArrayUgcPrograms = []; for (var i = 0; i < numberOfUGC; i++) { indexArrayUgcPrograms.push(i); }
                              
                              var iteratorPutUgcAndPaddingProgrames = function(indexOfUgcContents, interationDone_putUgcAndPaddingPrograms_cb){
                                  
                                  async.series([
                                                function(cb1){
                                                    //put UGC program
                                                    var aProgramTimeSlot = new ProgramTimeSlot(vjsonDefault);
                                                    aProgramTimeSlot.type = 'UGC';
                                                    aProgramTimeSlot.timeStamp = interval.start + '-' + pad(timeStampIndex, 3);
                                                    timeStampIndex++;
                                                    aProgramTimeSlot.save(function(err2, _result){     
                                                        cb1(err2);
                                                    });
                                                },
                                                function(cb2){
                                                    //put padding program
                                                    var aProgramTimeSlot = new ProgramTimeSlot(vjsonDefault);
                                                    aProgramTimeSlot.type = 'padding';
                                                    aProgramTimeSlot.content = paddingContents[indexOfUgcContents+1];
                                                    aProgramTimeSlot.markModified('content');
                                                    aProgramTimeSlot.timeStamp = interval.start + '-' + pad(timeStampIndex, 3);
                                                    timeStampIndex++;
                                                    aProgramTimeSlot.save(function(err3, _result){     
                                                        cb2(err3);
                                                    });
                                                }
                                  ],
                                  function(err, results){
                                      interationDone_putUgcAndPaddingPrograms_cb(err);
                                  });
                                  
                              };
                              async.eachSeries(indexArrayUgcPrograms, iteratorPutUgcAndPaddingProgrames, function(err){
                                  callback3(null);
                              });
                              
                          }
            ],
            function(err, results){
                generatedTimeSlotsOfMicroInterval_cb(err);
            });

            
        };
        
        //TODO: call the real ScalaMgr
        scalaMgr_listAvailableTimeInterval(intervalOfPlanningDoohProgrames,function(err, result){
            if (!err){
                
                //TODO: check if these available time intervals cover existing planned program time slots. If yes, maked the UGCs contained in these program time slots "must-play" and delete these program time slots.
                
                //generate program time slot documents (in programTimeSlot collection) according to available intervals and corresponding cycle durations
                var availableTimeIntervals = result;
                var iteratorGenerateTimeSlot = function(anAvailableTimeInterval, interationDone_cb){
                    //add time slots in this available time interval
                    var timeToAddTimeSlot = anAvailableTimeInterval.interval.start;
                    var programPeriod;
                    if (anAvailableTimeInterval.cycleDuration > DEFAULT_PROGRAM_PERIOD){
                        programPeriod = anAvailableTimeInterval.cycleDuration;
                    }
                    else {
                        programPeriod = DEFAULT_PROGRAM_PERIOD;
                    }
                    async.whilst(
                        function () { return timeToAddTimeSlot+anAvailableTimeInterval.cycleDuration <= anAvailableTimeInterval.interval.end; },
                        function (cb_whilst) {
                            // add time slots of a micro timeslot (of the same content genre) to db
                            var inteval = { start: timeToAddTimeSlot, end:timeToAddTimeSlot+programPeriod  };
                            generateTimeSlotsOfMicroInterval(inteval, function(err1){
                                timeToAddTimeSlot += programPeriod;
                                cb_whilst(err1);
                            });
                        },
                        function (err2) {
                            interationDone_cb(err2);
                        }
                    );
                };
                
                async.eachSeries(availableTimeIntervals, iteratorGenerateTimeSlot, function(err0){
                    if (!err0) {
                        //do the next step.... 
                        _cb1(null);
                    }
                    else{
                        _cb1('Failed to generate time slots in available time intervals: '+err0);
                    }
                });
                
               
            }
            else{
                _cb1('Failed to read available time interval list.', null);                    
            }
            
        });
        
    };  //end of generateTimeSlot()
    
    if (programSequence){
        programPlanningPattern.set(programSequence);
    }
    
    //TODO: call the real censorMgr
    censorMgr_getUGCList_fake(intervalOfSelectingUGC, function(err_1, _sortedUgcList ){
        
        //TODO: check the content genre of all these UGC contents. If any of the genres is missing, remove it from the programSequence of programPlanningPattern  
        
        if (!err_1){
            sortedUgcList = _sortedUgcList;
            generateTimeSlot( function(err_2){
                if (!err_2) {
                    //console.log('generateTimeSlot() done! ');
                    
                    putUgcIntoTimeSlots(function(err_3, result){
                        //console.log('putUgcIntoTimeSlots() done! ');
                        if (created_cb){
                            created_cb(err_3, result);
                        }                        
                    });
                }
                else {
                    if (created_cb){
                        created_cb('Failed to read sorted UGC list.', null);
                    }
                }
            });
        }
        else{
            if (created_cb){
                created_cb('Failed to read sorted UGC list.', null);
            }
        }
    });
    
    
};


/**
 * Get(a.k.a query) the programs (of a specific DOOH) of a specific interval.<br>
 * <br>
 * @param {String} dooh The ID of the DOOH where the program is to be updated
 * 
 * @param {Object} interval An object specifying the starting and ending of of the time interval to query 
 *     <ul>
 *     <li>start: the start of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *     <li>end: the end of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *     </ul>
 *     For example, {start: 1371861000000, end: 1371862000000} 
 * @param {Number} pageLimit The number of program time slot items to return (in got_cb's result).  If null, it returns all items.
 * @param {Number} pageSkip The number of program time slot items to skip when returning in in got_cb's result. If null, there is no skip.
 * @param {Function} got_cb The callback function called when the query is don.<br>
 *     The function signature is got_cb(err, resultProgramList):
 *     <ul>
 *     <li>err: error message if any error happens
 *     <li>resultProgramList: An array of objects containing program info:
 *         <ul>
 *         <li>_id: A string (i.e. a hex string representation of its ObjectID in MongoDB) specifying the ID of a program time slot item  
 *         <li>timeSlot: An object specifying the starting and ending time of program's time slot
 *             <ul>
 *             <li>start: the start of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *             <li>end: the end of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *             </ul>
 *         <li>ugc: A number specifying the ID of the UGC contained in this program. (This is
 *             actually the id of items store in UGC collection.) 
 *         </ul>
 *         For example, <br>
 *         [{_id:43524, timeSlot:{start:1371861000000, end :1371862000000}, ugc:48593},<br>
 *          {_id:43525, timeSlot:{start:1371881000000, end:1371882000000}, ugc:48353},<br>
 *          {_id:43544, timeSlot:{start:1371897000000, end:1371898000000}, ugc:43593}]
 *         
 *     </ul>
 */
scheduleMgr.getProgramList = function(dooh, interval, pageLimit, pageSkip, got_cb ){
    var query = programTimeSlotModel.find({ "timeslot.start": {$gte:interval.start}, "timeslot.end":{$lt:interval.end}, "type": "UGC", "dooh": dooh })
                        .sort({timeStamp:1});
    
    if (pageLimit!==null){
        query = query.limit(pageLimit);
    }
    
    if (pageSkip!==null){
        query = query.skip(pageSkip);
    }
        
    query.exec(function (_err, result) {
        if (got_cb){
            got_cb(_err, result);
        }
        
    });
};

/**
 * Get the programs of a specific planning sessions (a.k.a. calling scheduleMgr.createProgramList() ).<br>
 * <br>
 * @param {String} sessionId The id indicating the session of creating program time slot (This session id is accquired in the callback 
 *     passed to scheduleMgr.createProgramList(). )
 * @param {Number} pageLimit The number of program time slot items to return (in got_cb's result).  If null, it returns all items.
 * @param {Number} pageSkip The number of program time slot items to skip when returning in in got_cb's result. If null, there is no skip.
 * @param {Function} got_cb The callback function called when the query is don.<br>
 *     The function signature is got_cb(err, resultProgramList):
 *     <ul>
 *     <li>err: error message if any error happens
 *     <li>resultProgramList: An array of objects containing program info:
 *         <ul>
 *         <li>_id: A string (i.e. a hex string representation of its ObjectID in MongoDB) specifying the ID of a program time slot item  
 *         <li>timeSlot: An object specifying the starting and ending time of program's time slot
 *             <ul>
 *             <li>start: the start of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *             <li>end: the end of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *             </ul>
 *         <li>ugc: A number specifying the ID of the UGC contained in this program. (This is
 *             actually the id of items store in UGC collection.) 
 *         </ul>
 *         For example, <br>
 *         [{_id:43524, timeSlot:{start:1371861000000, end :1371862000000}, ugc:48593},<br>
 *          {_id:43525, timeSlot:{start:1371881000000, end:1371882000000}, ugc:48353},<br>
 *          {_id:43544, timeSlot:{start:1371897000000, end:1371898000000}, ugc:43593}]
 *         
 *     </ul>
 */
scheduleMgr.getProgramListBySession = function(sessionId, pageLimit, pageSkip, got_cb ){
    
};

/**
 * Push programs (of a specific session) to the 3rd-party content manager.<br>
 * <br>
 * @param {String} sessionId The id indicating the session of creating program time slot (This session id is accquired in the callback 
 *     passed to scheduleMgr.createProgramList(). )
 * @param {Function} pushed_cb The callback function called when the process is done.<br>
 *     The function signature is updated_cb(err), where err is the error message indicating failure: 
 *     if successful, err returns null; if failed, err returns the error message.
 */
scheduleMgr.pushProgramsTo3rdPartyContentMgr = function(sessionId, pushed_cb) {
    
};

/**
 * Push programs (of a specific session) to the 3rd-party content manager.<br>
 * <br>
 * @param {String} sessionId The id indicating the session of creating program time slot (This session id is accquired in the callback 
 *     passed to scheduleMgr.createProgramList(). )
 * @param {Function} pushed_cb The callback function called when the process is done.<br>
 *     The function signature is updated_cb(err), where err is the error message indicating failure: 
 *     if successful, err returns null; if failed, err returns the error message.
 */

scheduleMgr.pullProgramsFrom3rdPartyContentMgr = function(sessionId) {
    
};

/**
 * Update the programs (of a specific DOOH) of a specific interval.<br>
 * <br>
 * This method will ask ScalaMgr about the latest available time intervals (in which Miix system
 * can play its UGC content) and then re-schedule the programs accordingly. 
 * 
 * @param {String} dooh The ID of the DOOH whose programs are to be updated
 * 
 * @param {Object} intervalToUpdate An object specifying the starting and ending of  
 *     of the time interval in which the scheduled programs will be updated   
 *     <ul>
 *     <li>start: the start of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *     <li>end: the end of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *     </ul>
 *     For example, {start: 1371861000000, end: 1371862000000} 
 * @param {Function} updated_cb The callback function called when the program list is updated.<br>
 *     The function signature is updated_cb(err, listOfProgramsOutOfSchedule) :
 *     <ul>
 *     <li>err: error message if any error happens
 *     <li>listOfProgramsOutOfSchedule: An array of objects containing program info:
 *         <ul>
 *         <li>programTimeSlot: A string specifying the ID (the hex string representation of its ObjectID in MongoDB) of the program item which is removed from the schedule 
 *             after updating 
 *         <li>ugc: A string specifying the ID (the hex string representation of its ObjectID in MongoDB) of the UGC contained in this removed program. (This is
 *             actually the id of items store in ugc collection.) 
 *         </ul>
 *         For example, <br>
 *         [{programTimeSlot:43524, ugc:48593},<br>
 *          {programTimeSlot:43525, ugc:48353},<br>
 *          {programTimeSlot:43544, ugc:43593}]
 *         
 *     </ul>
 */
scheduleMgr.updateProgramList = function(dooh, intervalToUpdate, updated_cb ){
    
};



/**
 * Set an UGC of specific No to be played in a specific program time slot (of a specific DOOH <br>
 * <br>
 * @param {String} programTimeSlot The ID of the program time slot item
 * 
 * @param {Number} ugcReferenceNo The reference No the UGC item to put in the specified program time slot
 * 
 * @param {Function} set_cb The callback function called when the process is done.<br>
 *     The function signature is updated_cb(err) where err is the error message indicating failure: 
 *     if successful, err returns null; if failed, err returns the error message.
 *     
 */
scheduleMgr.setUgcToProgram = function( programTimeSlotId, ugcReferenceNo, set_cb ){
    ugcModel.findOne({ 'no': ugcReferenceNo }, '_id contentGenre', function (err1, ugc) {
        if (!err1){
            var oidOfprogramTimeSlot = mongoose.Types.ObjectId(programTimeSlotId);
            var _ugc = JSON.parse(JSON.stringify(ugc)); //clone ugc object due to strange error "RangeError: Maximum call stack size exceeded"
            
            db.updateAdoc(programTimeSlotModel, oidOfprogramTimeSlot, {"content": _ugc }, function(err2, result){
                if (set_cb){
                    set_cb(err2, result);
                }
            });
            
            //set_cb(err1, ugc);
        }
        else {
            if (set_cb){
                set_cb("Cannot find the UGC with this referece number: "+err1, null);
            }
        }
    });
};


/**
 * Remove the UGC from a specific progrm (of a specific DOOH) and automatically set a new UGC back to this program time slot <br>
 * <br>
 * @param {String} sessionId The id indicating the session of creating program time slot (This session id is accquired in the callback 
 *     passed to scheduleMgr.createProgramList(). )
 * 
 * @param {String} programTimeSlot The ID of the program time slot item
 * 
 * @param {Function} removed_cb The callback function called when this process is done.<br>
 *     The function signature is removed_cb(err, newlySelectedUgc): 
 *     <ul>
 *     <li>err: error message if any error happens
 *     <li>newlySelectedUgc: the id of newly selected UGC (i.e. a hex string representation of its ObjectID in MongoDB)
 *     </ul>
 *     
 */
scheduleMgr.removeUgcfromProgramAndAutoSetNewOne = function(sessionId, programTimeSlot, removed_cb ){
    
    var oidOfprogramTimeSlot = mongoose.Types.ObjectId(programTimeSlot);
    var originalUgc = null;
    var sortedUgcList = null;
    var candidateUgcList = [];
    var selectedUgc = null;
    var indexOfLatCandidatUgcCache = 0;
    
    
    async.series([
                  function(cb0){
                      //get the sorted UGC list
                      var sessionIdInfoArray = sessionId.split('-');
                      var interval = {start: Number(sessionIdInfoArray[0]), end: Number(sessionIdInfoArray[1]) };
                      
                      //TODO: call the real censorMgr
                      censorMgr_getUGCList_fake(interval, function(err0, _sortedUgcList ){
                          if (!err0) {
                              sortedUgcList = _sortedUgcList;
                              //console.log('sortedUgcList=');
                              //console.dir(sortedUgcList);
                              cb0(null);
                          }
                          else {
                              cb0('Failed to get UGC list: '+err0);
                          }
                      });
                  },
                  function(cb1){
                      //find the corresponding program time slot with id ("programTimeSlot" parameter)
                      programTimeSlotModel.findOne({ '_id': oidOfprogramTimeSlot }, 'content', function (err1, doc) {
                          if (!err1){
                              originalUgc = doc.content;
                              //console.log('originalUgc=');
                              //console.dir(originalUgc);   
                              //debugger; 
                              cb1(null);
                          }
                          else {
                              cb1('Cannot find the corresponding program time slot with id: '+err1);
                          }
                          
                      });
                  },
                  function(cb2){
                      //mark this UGC as "mustPlay" 
                      if ( originalUgc._id ){
                          var oidOfOriginalUgc = mongoose.Types.ObjectId(originalUgc._id); 
                          db.updateAdoc(ugcModel, oidOfOriginalUgc, {"mustPlay": true }, function(err2, ugc){
                              if (!err2){
                                  cb2(null);
                                  //debugger; 
                                  //console.log("The removed UGC=");
                                  //console.dir(ugc);
                              }
                              else {
                                  cb2('Cannot mark this UGC as "mustPlay": '+err2);
                              }
                          });
                      }
                      else{
                          cb2("This program time slot does not contain valid UGC");
                      }
                      
                  },
                  function(cb3){
                      //get candidate UGCs from DB 
                      candidateUgcCacheModel.find({ "sessionId": sessionId }).sort({"index":1}).exec(function (err3, doc) {
                          if (!err3){
                              for (var i=0; i<doc.length; i++) {
                                  candidateUgcList.push(doc[i].candidateUgc);
                              }
                              indexOfLatCandidatUgcCache = doc[doc.length-1].index;
                              //console.log('indexOfLatCandidatUgcCache=%s', indexOfLatCandidatUgcCache);
                              //debugger;
                              //console.log("candidateUgcList=");
                              //console.dir(candidateUgcList);               
                              cb3(null);
                          }
                          else {
                              cb3('Failed to get candidate UGCs from DB: '+err3_1);
                          }
                      });
                  },
                  function(cb4){
                      //find next matching UGC candidate (with the same gendre)  
                      for (var indexOfcandidateToSelect=0; indexOfcandidateToSelect<=candidateUgcList.length; indexOfcandidateToSelect++){
                          
                          if (indexOfcandidateToSelect == candidateUgcList.length){
                              candidateUgcList = candidateUgcList.concat(sortedUgcList);
                          }
                          
                          if ( candidateUgcList[indexOfcandidateToSelect].contentGenre == originalUgc.contentGenre){
                              selectedUgc = candidateUgcList.splice(indexOfcandidateToSelect, 1)[0];
                              break;
                          }
                      } 
                      //console.log("selectedUgc=");
                      //console.dir(selectedUgc);    
                      
                      candidateUgcCacheModel.remove({"candidateUgc._id" : selectedUgc._id}, function(err4, result){
                          if (!err4){
                              //console.log("result=");
                              //console.dir(result);
                              cb4(null);
                          }
                          else {
                              cb4('Failed to remove the selected candidate UGC from DB (candidateUgcCache): '+err4);
                          }
                      });
                  }, 
                  function(cb5){
                      //update the content of the program time slot with the found UGC candidate  
                      var _selectedUgc = JSON.parse(JSON.stringify(selectedUgc)); //clone selectedUgc object to prevent from a strange error "RangeError: Maximum call stack size exceeded"
                      db.updateAdoc(programTimeSlotModel, oidOfprogramTimeSlot, {"content": _selectedUgc }, function(err5, result){
                          if (!err5){
                              cb5(null);
                          }
                          else {
                              cb5('Failed to update the content of the program time slot with the found UGC candidate: '+err5);
                          }
                      });
                  },
                  function(cb6){  //TODO: possibly need further verify the implementation of this function
                      //update candidate UGC to DB
                      
                      //for test only
                      //candidateUgcList = candidateUgcList.concat(sortedUgcList); 
                      
                      var iteratorUpdateCandidateUgcListToDB = function(aCandidateUgc, interationDone_cb){
                          
                          candidateUgcCacheModel.find({ "candidateUgc._id": aCandidateUgc._id }).exec(function (err6_1, _result) {
                              if (!err6_1) {
                                  //console.log("_result=");
                                  //console.dir(_result);
                                  if (_result.length === 0){
                                      //create candidate UGC cache in DB
                                      var CandidateUgcCache = db.getDocModel("candidateUgcCache");
                                      var aCandidateUgcCache = new CandidateUgcCache();
                                      aCandidateUgcCache.sessionId = sessionId;
                                      indexOfLatCandidatUgcCache++;
                                      aCandidateUgcCache.index = indexOfLatCandidatUgcCache;
                                      var _candidateUgc = JSON.parse(JSON.stringify( aCandidateUgc )); //clone candidateUgc object to prevent from strange error "RangeError: Maximum call stack size exceeded"
                                      aCandidateUgcCache.candidateUgc = _candidateUgc;
                                      aCandidateUgcCache.markModified('candidateUgc');
                                      aCandidateUgcCache.save(function(err6, aSavedCandidateUgcCache){     
                                          if (!err6){
                                              interationDone_cb(null);
                                              //console.log("aSavedCandidateUgcCache=");
                                              //console.dir(aSavedCandidateUgcCache);
                                          }
                                          else {
                                              interationDone_cb('Failed to update candidate UGC to DB: '+err6);
                                          }
                                      });   
                                  }
                                  else {
                                      interationDone_cb(null);
                                  }
                              }
                              else {
                                  interationDone_cb("Failed to query candidateUgcCache by candidateUgc._id: "+err6_1);
                              }
                          });
                      };
                      
                      async.eachSeries(candidateUgcList, iteratorUpdateCandidateUgcListToDB, function(err6){
                          if (!err6) {
                              cb6(null);
                          }
                          else {
                              cb6('Failed to update candidate UGC to DB: '+err6);
                          }
                      });
                  }
    ],
    function(err){
        if (!err) {
            if (removed_cb){
                removed_cb(null, selectedUgc._id);
            }
        }
        else {
            if (removed_cb){
                removed_cb(err, null);
            }
        }
        
    });
    
};

/**
 * Get a list showing all the planning sessions (a.k.a. calling scheduleMgr.createProgramList()) done in the past.<br>
 * <br>
 * @param {Number} pageLimit The number of program time slot items to return (in got_cb's result).  If null, it returns all items.
 * @param {Number} pageSkip The number of program time slot items to skip when returning in in got_cb's result. If null, there is no skip.
 * @param {Function} got_cb The callback function called when the query is don.<br>
 *     The function signature is got_cb(err, resultSessionList):
 *     <ul>
 *     <li>err: error message if any error happens
 *     <li>resultSessionList: An array of objects containing program info:
 *         <ul>
 *         <li>_id: A string (i.e. a hex string representation of its ObjectID in MongoDB) specifying the ID of a session item  
 *         
 *         <li>dooh: The ID of the DOOH upon which the selected UGCs are played
 *         
 *         <li>intervalOfSelectingUGC: An object specifying the starting and ending of  
 *             of the time interval for scheduleMgr to select the applied UGC items <br>
 *             <ul>
 *             <li>start: the start of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *             <li>end: the end of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *             </ul>
 *             For example, {start: 1371861000000, end: 1371862000000} 
 *
 *         <li>intervalOfPlanningDoohProgrames: An object specifying the starting and ending of  
 *             of the time interval which the generated schedule covers   
 *             <ul>
 *             <li>start: the start of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *             <li>end: the end of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *             </ul>
 *             For example, {start: 1371861000000, end: 1371862000000} 
 * 
 *         <li>programSequence An array of strings showing the sequence of program genres to use when 
 *             when the system is planning the program(s) of a "micro time interval" <br>
 *             Note: the string must be "miix", "cultural_and_creative", "mood", or "check_in"
 *             For example, ["miix", "check_in", "check_in", "mood", "cultural_and_creative" ] <br>
            
 *         </ul>
 *         For example, <br>
 *         [{_id:"3g684j435g5226h5648jrk24", dooh:"TP_dom", intervalOfSelectingUGC:{start:1371861000000, end :1371862000000}, intervalOfPlanningDoohProgrames:{start:1371861000000, end :1371862000000}, programSequence:["miix", "check_in", "check_in", "mood", "cultural_and_creative" ]},<br>
 *          {_id:"3g684j435g5632h5648jrk24", dooh:"TP_dom", intervalOfSelectingUGC:{start:1371881000000, end:1371882000000}, intervalOfPlanningDoohProgrames:{start:1371861000000, end :1371862000000}, programSequence:["miix", "check_in", "check_in", "mood", "cultural_and_creative" ]},<br>
 *          {_id:"3g684j43e64hf6h5648jrk24", dooh:"TP_dom", intervalOfSelectingUGC:{start:1371897000000, end:1371898000000}, intervalOfPlanningDoohProgrames:{start:1371861000000, end :1371862000000}, programSequence:["miix", "check_in", "check_in", "mood", "cultural_and_creative" ]}]
 *         
 *     </ul>
 */
scheduleMgr.getSessionList = function(pageLimit, pageSkip, got_cb ){
    
};



module.exports = scheduleMgr;