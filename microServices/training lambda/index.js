var rekog = require("./Rekog.js");
var dbDriver = require("./DbDriver.js");

var rek = new rekog();
// var buckOb = new bucket();

exports.handler = (event, context, callback) => {
    // TODO implement
    // console.log(JSON.stringify(event));
    // console.log("Bucket name",event.Records[0].s3.bucket.name);
    console.log("UPLOADED FILE NAME :",event.Records[0].s3.object.key);
    let fileNameParts=event.Records[0].s3.object.key.split('/');
    let externalImageId = fileNameParts[1].split('.');
    
    rek.addFaceToCollection(process.env.collection,process.env.bucketname,event.Records[0].s3.object.key,externalImageId[0],(err,data)=>{
      
      if(err){
          
          console.log(`Error Training ${externalImageId[0]} ${err}`);
      
      }else{
          
          console.log("Training success for", externalImageId[0] ,data.FaceRecords[0].Face.FaceId);
          console.log("INSERT INTO "+"`"+"tempid"+"`"+"."+"`"+"REKOG_DETAILS"+"`"+" (`emp_id`, `face_id`) VALUES "+"('"+externalImageId[0]+"','"+data.FaceRecords[0].Face.FaceId+"');");
          
          // "INSERT INTO "+"`"+"tempid"+"`"+"."+"`"+"REKOG_DETAILS"+"`"+" (`emp_id`, `face_id`) VALUES "+"('"+externalImageId[0]+"','"+data.FaceRecords[0].Face.FaceId+"');"
          
          
          var connection=dbDriver.CreateNewConnection();
          
          new dbDriver().query(connection,"INSERT INTO "+"`"+"tempid"+"`"+"."+"`"+"REKOG_DETAILS"+"`"+" (`emp_id`, `face_id`) VALUES "+"('"+externalImageId[0]+"','"+data.FaceRecords[0].Face.FaceId+"');",(err,data)=>{
            
            if(err){
              console.log("ERROR recording face ID in db",err);
            }
            else{
              console.log("FaceID recorded in db",data)
            }
            
          });
      }
      
    })
    
};