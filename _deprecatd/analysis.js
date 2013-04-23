var FMDB = require('./db.js');
var FM = {};

FM.ANALYSIS = (function(){
    var uInstance = null;
    
    function constructor(){
        //var FMDB = DB.getInstance();
        var analysis = FMDB.getDocModel("analysis");
        
        return {
        /*
         * Public
         */
            updateRecord : function(condition, newdata, options, cb){
				FMDB.updateOne(analysis, condition, newdata, options, cb);
			},
        };
    } //    End of Constructor
    
    return {
        getInstance: function(){
            if(!uInstance){
                uInstance = constructor();
            }
            return uInstance;
        }
    };
})();

module.exports = FM.ANALYSIS.getInstance();