var request =require('request')
var fs =require('fs')
var config = require("../config")
const loggerConfiguration =require('../logger');
const logger= loggerConfiguration.loggerob;

module.exports = {
    
    'GetEmpDetails': function(id, callback){

        if(process.env.empdatasource=="json"){

            logger.debug("Source: JSON");
            let empjson = fs.readFileSync('./emp.json'); 
            let empdata = JSON.parse(empjson); 

            for(var i=0;i<empdata.Empdata.length;i++){
                if(empdata.Empdata[i].employeeid==id){
                    logger.debug("id matched",empdata.Empdata[i].employeeid);
                    callback(null,empdata.Empdata[i])
                    break;
                }else{

                    if(empdata.Empdata.length-1 ==i){
                        callback(null,{"employeeid":id ,ipagedetails_official_info:[]})
                    }

                }
            }
           
            //TODO implement reading json for data
        }else{

            logger.debug("SOURCE ISG API");
            options ={
               method:'GET',
               url: config.ISGempApi.empServiceUrl+id,
               headers:{
                   "Content-Type": "application/json",
                   Authorization : "Bearer "+config.ISGempApi.token
               },
               json: true
           };
           request(options,function(error,response,body) {
               if(error){
                   logger.error("Error from ISG employee details API : " + error)
                   callback(error, null)
               }
               else if(body.message == "Authorization has been denied for this request.") {
                logger.error("your authorization token is expired please change it")
                callback(body.message,null)
            }
               else{
                   logger.debug("Response from ISG employee API : " + JSON.stringify(body))
                   callback(null, body);
               }
           })

        }


    },


    'PostEmpDetails' :function(id,image,callback){
        options ={
            method:'POST',
            url: config.ISGempApi.empUploadUrl,
            headers:{
                "Content-Type": "application/json",
               " Authorization" : "Bearer "+config.ISGempApi.token
            },
            body :{
                "imagename":id,
                "imagestring":image,
            },
            json: true
        };
        request(options,function(error,response,body) {
            if(error){
                logger.error("Error from EMP Upload API : " + error)
                callback(error, null)
            }
            else if(body.message == "Authorization has been denied for this request.") {
             logger.error("your authorization token is expired please change it")
             callback(body.message,null)
         }
            else{
                logger.debug("EMP Upload  API : " + JSON.stringify(body))
                callback(null, body);
            }
        })

    }

}
