var fs = require("fs");
var moment = require("moment");
var dbConnector = require("./dbConnector")
var dbDriver 
var connection = dbConnector.CreateConnectionPool();
const loggerConfiguration =require('../logger');
const logger= loggerConfiguration.loggerob;

connection.on('connect',()=>{
    logger.debug("Connected to DB")
});
connection.on('end',()=>{
    logger.debug('connection ended');
});
connection.on('error', function(err) {
    logger.error("DB ERROR IN  TRACKER"+err.code); 
});

class tracker {

    constructor() {

        logger.debug("Defaulter tracker initialized");
        dbDriver = new dbConnector();

    }

    createRegister() {

        if (!fs.existsSync("trace")) {
            fs.mkdirSync("trace");

            fs.writeFile('trace/trace.json', "[]", (err) => {
                if (err) {
                    logger.error("Error in creating register"+err);
                    logger.warn("Cannot record transactions"+err);
                } else {
                    logger.info("Transaction Register created");
                }
            });

        }

    }


    recordDefaulter(data,callback) {
        if (process.env.dbconnection == 'true') {
        
            dbDriver.query(connection, dbDriver.queryGenerator("INSERT", data), (err, data) => {
                if (err) {
                    logger.error("ERROR in inserting data" +err);
                    callback(err,null);
                } else {
                    logger.debug("DATA inserted" + data);
                    callback(null,data);
                }
            })

        } else {


            fs.readFile("trace/trace.json", (err, fileData) => {
                if (err) {
                    callback(err, null);
                } else {

                    var defaulterList = JSON.parse(fileData.toString());
                    defaulterList.push(data);
                    fs.writeFile('trace/trace.json', JSON.stringify(defaulterList), (err) => {
                        if (err) {
                            logger.error("Error in writing defaulter list"+ err);
                            logger.warn("Unable to record transaction"+data); 
                            callback(err,null)
                        } else {
                            logger.debug("recorded"+data);
                            callback(null,data)
                        }
                    });

                }

            });

        }

    }


    filterRegularDefaulter(empId, date, callback) {

        if (process.env.dbconnection == 'true') {

            var Selectrecord = {
                "empId": empId,
                "date": date
            }
            dbDriver.query(connection, dbDriver.queryGenerator("SELECT", Selectrecord), (err, data) => {
                if (err) {
                    logger.error("ERROR in inserting data"+ err);
                    callback(err, null)
                } else {
                    if (data.length == 0) {
                        logger.debug("RESPONSE FROM DB is no ")
                        callback(null, "no");
                    } else {
                        logger.debug("RESPONSE FROM DB is yes ")
                        callback(null, "yes");
                    }

                }
            })

        } else {

            fs.readFile("trace/trace.json", (err, fileData) => {
                logger.debug("Offline tracker")
                if (err) {
                    logger.error("Error in reading file while scanning defaulter"+err);
                    callback(err, null);

                } else {
                    logger.debug(fileData)
                    var traceRecord = JSON.parse(fileData.toString());
                    logger.debug(traceRecord.length);
                    for (var ele = 0; ele <= traceRecord.length; ele++) {
                        logger.debug("inside for loop")
                        logger.debug(traceRecord.length);
                        if( traceRecord.length == 0){
                            logger.debug("Not a defaulter");
                            callback(null, "no");
                        }
                        else if (empId == traceRecord[ele].empId) {

                            if (moment(moment(new Date)).diff(moment(traceRecord[ele].date, "YYYY.MM.DD"), "day") == 1) {

                                logger.debug("lost yesterday");
                                callback(null, "yes");
                                break;

                            } else {
                                logger.debug(traceRecord.length);
                                if (traceRecord.length - 1 == ele ) {
                                    logger.debug("Not a defaulter");
                                    callback(null, "no");
                                }
                            }
                        }

                    }

                }

            })

        }

    }

}

module.exports = tracker;


