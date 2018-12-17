 var dbDriver = require('./dbConnector');
 var config = require('../config')
 const loggerConfiguration =require('../logger');
const logger= loggerConfiguration.loggerob;

 var dbDriverOb 
 var connection;

 class dbRestHandler{

    constructor(){
        logger.debug("dbrestHandler object created");
        if (connection == null) {
            connection =  dbDriver.CreateConnectionPool();
        }
        dbDriverOb = new dbDriver()
    }

    

    getResults(face_id,callback){

        // SELECT * FROM ${req.params.tablename} LIMIT 100
            logger.debug("Search params :"+face_id);
            
           

            dbDriverOb.query(connection,"select `emp_id` from "+config.Db.Recoginfotable  + " where `face_id` = '"+face_id+"';" ,(err,data)=>{
                if(err){
                    logger.error("Error in db query of faceid from dbRestHandler" +err)
                    callback(err,null);
                }else{
                    logger.debug("Succesfully queried faceid and got the employee ID as "  +JSON.stringify(data))
                    callback(null,data);
                }
            })

    }

    insertData(emp_id,face_id,callback){

        logger.debug("insert  params :"+ emp_id + " " +face_id);         
        dbDriverOb.query(connection,"INSERT INTO "+"`"+config.Db.Recoginfotable+"`"+" (`emp_id`, `face_id`) VALUES "+"('"+emp_id+"','"+face_id+"');",(err,data)=>{
            if(err){
                logger.error("Error in db insertion of faceid and empid in dbRestHandler" +err)
                callback(err,null);
            } else{
                logger.debug("Succesfully inserted  faceid and employee ID in dbRestHandler"+emp_id +" " +face_id)
                callback(null,data)
            }
        })

    }



 }
 module.exports = dbRestHandler;