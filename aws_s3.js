
var FM = {};

FM.AWSS3 = (function(){
    var fs = require('fs');
    var uInstance = null;

    var S3_KEY = 'AKIAIGODK62AFWNIHQ6Q',
    S3_SECRET = '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';
    S3_BUCKET = 'miix_content';//default

    var s3Client = require('knox').createClient({
    	
        key: S3_KEY,
        secret: S3_SECRET,
        bucket: S3_BUCKET
    });

    function constructor(){
        return {

            /**
             *  Connect Aws S3 Bucket
             */
            connectAwsS3Bucket : function(bucket){
                s3Client = require('knox').createClient({
                    key: S3_KEY,
                    secret: S3_SECRET,
                    bucket: bucket
                });
            },

            /**
             *  List Aws S3 Object
             */
            listAwsS3 : function(str,cb){
                s3Client.list({ prefix: str }, function(err, result){
                    if (err) cb(err, null);
                    else cb(null, result);
                });
            },

            /**
             *  Upload Photo To Aws S3.
             */
            uploadToAwsS3 : function(obj, awsKey, contentType, cb){
            	console.log("[AWS] uploadToAwsS3");
                if (!contentType){
                    contentType = 'image/jpeg';
//                	contentType = 'video/mp4';
                }
                
                /**
                 * Save file to S3 and make public link 
                 * x-amz-acl : public-read
                 * by Jean
                 * 
                 * header testing in app.js(line 447: test_s3)
                 */
                var header = {
                		'Content-Type' : contentType,
                		'x-amz-acl' : "public-read"
                };
//                s3Client.putFile(obj, awsKey, {'Content-Type': contentType}, function(err, result) {
                s3Client.putFile(obj, awsKey, header, function(err, result){
                    if (err) {
                        if (cb) {
                            cb(err, null);
                            console.log("[AWS] uploadToAwsS3 error");
                        }
                    }
                    else {
                        if (cb) {
                            cb(null, "Uploaded Successful");
                            console.log("[AWS] uploadToAwsS3 success");
                        }
                    }
                });
            },

            /**
             *  Download Photo From Aws S3.
             */
            downloadFromAwsS3 : function(obj,awsKey,cb){
                var file = fs.createWriteStream(obj);
                s3Client.getFile(awsKey, function(err, res) {
                    res.on('data', function(data) { file.write(data); });
                    res.on('end', function(chunk) { 
                        file.end(); 
                        if (cb) {
                            cb(null, "Download Successful");
                        }
                    });

                    if (err) {
                        if (cb) cb(err, null);
                    }
                    
                });
            },


        };//   End return

    }//   End constructor

    return {
        getInstance: function(){
            if(!uInstance){
                uInstance = constructor();
            }
            return uInstance;
        }
    }; //   End of Return uInstance.


})();

module.exports = FM.AWSS3.getInstance();
