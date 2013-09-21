
exports.init = function() {
    
    require('./api_generic.js').init();
    require('./api_internal.js').init();
    require('./api_miix.js').init();
    require('./api_miix_service.js').init();

    
    
};