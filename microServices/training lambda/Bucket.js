var AWS = require('aws-sdk');
var s3 = new AWS.S3({apiVersion: '2006-03-01'});

class Bucket{
    
    constructor(){
        
        // console.log("instantiating bucket object");
        // console.log("pointing to bucket",process.env.bucketname);
        
    }
    
    getAllObjects(callback){
        
        
        var params = {
            
            Bucket: process.env.bucketname, /* required */
            // Prefix: process.env.foldername,
            Delimiter: ".jpeg",
            MaxKeys: 1000,
            
        };
        
        s3.listObjectsV2(params, function(err, data) {
          if (err){
              
            //   console.log(err, err.stack); // an error occurred
              callback(err,null);
          
          }else{
              
            //   console.log(data)// successful response
              callback(null,data.CommonPrefixes);
          }
            
        });

    }
    
}

module.exports=Bucket;

    
    