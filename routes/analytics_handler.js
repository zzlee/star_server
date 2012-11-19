exports.recordUserAction_cb = function(req, res) {

	if ( req.body.ownerID ) {
		console.log('{%s} User action:', req.body.ownerID._id )
		console.dir(req.body);

	}
}