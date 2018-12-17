var AWS = require('aws-sdk');
var rekognition = new AWS.Rekognition({region: "us-east-1"});

class Rekog{
    
    constructor(){
        
        // console.log("initiating RekogImage");
        
    }
    
    createNewCollection(collectionName,callback){
        
         var params = {
          CollectionId: collectionName
         };
         
         rekognition.createCollection(params, function(err, data) {
             
             if (err){
               
               console.log(err, err.stack);
               callback(err,null);
               
           }else{
               
               console.log(data);
               callback(null,data);
           }
             
         });
        
    }
    
    deleteExistingCollection(collectionName,callback){
        
        var params = {
            
            CollectionId: collectionName 
            
        };
        rekognition.deleteCollection(params, function(err, data) {
            if (err){
              
            //   console.log(err, err.stack);
              callback(err,null);
                
            }else{
                
                // console.log(data);
                callback(null,data);
            
            }     
        });

    }
    
    
    addFaceToCollection(collectionName,bucketName,fileName,empid,callback){
        
        var params = {
            CollectionId: collectionName, /* required */
            Image: { /* required */
            // Bytes: new Buffer('...') || 'STRING_VALUE' /* Strings will be Base-64 encoded on your behalf */,
            S3Object: {
                Bucket: bucketName,
                Name: fileName,
                // Version: 'STRING_VALUE'
            }
          },
          DetectionAttributes: ["DEFAULT"],
          ExternalImageId: empid
        };
        
        rekognition.indexFaces(params, function(err, data) {
            if (err){
                //  console.log(err, err.stack); 
                 callback(err,null)
            }else{
                // console.log(JSON.stringify(data));
                callback(null,data);
            }
            
        });
        
    }
    
    rekognize(collectionName,bucketName,fileName,callback){
        
        var params = {
          CollectionId: collectionName, /* required */
          Image: { /* required */
            // Bytes: new Buffer('...') || 'STRING_VALUE' /* Strings will be Base-64 encoded on your behalf */,
            S3Object: {
              Bucket: bucketName,
              Name: fileName,
            //   Version: 'STRING_VALUE'
            }
          },
          FaceMatchThreshold: 95.0,
          MaxFaces: 2
        };
        rekognition.searchFacesByImage(params, function(err, data) {
          if (err){
            //   console.log(err, err.stack);
              callback(err,null);
              
          } 
          else{
            //   console.log(data);
              callback(null,data);
          }
            
        });
        
    }
    
    
    deleteface(collectionName,faceids,callback){
        var params = {
            CollectionId: collectionName, 
            FaceIds:faceids 
        };
        rekognition.deleteFaces(params, function(err, data) {
            if (err){
                
                // console.log(err, err.stack); // an error occurred
                callback(err,null);
                
            } 
            else{
                
                // console.log(data);           // successful response
                callback(null,data);
            }     
        });
    }
    
    
    getFacesInCollection(collectionName,callback){
        
        var params = {
            CollectionId: collectionName, /* required */
            MaxResults: 200,
            // NextToken: 'STRING_VALUE'
        };
        rekognition.listFaces(params, function(err, data) {
          if (err){
              
            // console.log(err, err.stack); // an error occurred
            callback(err,null);
              
          }else{
              
            //   console.log(data);           // successful response
              callback(null,data);
          }     
        });

    }
    
    
    rekognizeVideo(collectionName,bucketname,filename,callback){
        
        var params = {
            CollectionId: collectionName, /* required */
            Video: {
                
                S3Object: {
                    Bucket: bucketname,
                    Name: filename,
                    // Version: 'STRING_VALUE'
                }
                
            },
            // ClientRequestToken: 'STRING_VALUE',
            FaceMatchThreshold: 97.0,
            // JobTag: 'STRING_VALUE',
            NotificationChannel: {
                
                RoleArn: process.env.rolearn, /* required */
                SNSTopicArn: process.env.topicarn /* required */
                
            }
            
        };
        
        rekognition.startFaceSearch(params, function(err, data) {
          
          if (err){
            
            console.log(err, err.stack);
            callback(err,null); 
            
          }else{
              
              console.log(data);
              callback(null,data);
          }
            
        });
        
    }
    
}

module.exports=Rekog;