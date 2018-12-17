var mysql = require('mysql');
var config = require('../config')
const loggerConfiguration =require('../logger');
const logger= loggerConfiguration.loggerob;

class DbConnector{

    constructor(){

        logger.debug("instantiating DbConnector ");

    }

    static CreateConnectionPool(){

        return mysql.createPool({
            connectionLimit : 5,
            host            : config.Db.hostname,
            user            : config.Db.username,
            password        : config.Db.password,
            database        : config.Db.database
          });
    
    }

    static CreateNewConnection(){

        return mysql.createConnection({
            host     : config.Db.hostname,
            user     : config.Db.username,
            password : config.Db.password,
            database : config.Db.dbname
          });

    }

    query(connection,sqlQuery,callback){
        
        connection.query(sqlQuery, function (error, results, fields) {
            if (error){
                logger.error("Error processing query\n"+error)
                callback(error,null);
            }else{
                logger.debug('Query Results: \n' +JSON.stringify(results));
                callback(null,results);
            }
          });

    }

    queryGenerator(operation,data){

        if(operation==="INSERT"){

            return "INSERT INTO "+"`"+config.Db.database+"`"+"."+"`"+config.Db.tablename+"`"+" (`EMP_ID`, `DATE`, `IN_TIME`) VALUES "+"('"+data.empId+"','"+data.date+"','"+data.intime+"');"
    
        }

        if(operation==="UPDATE"){
            
            return "UPDATE"+ "`"+config.Db.database+"`"+"."+"`"+config.Db.tablename+"`"+" SET `OUT_TIME`='"+data.outTime +"' WHERE `date`='"+data.date+"' and `EMP_ID`='"+data.empid+"';"

        }

        if(operation==="SELECT"){

            return "SELECT * FROM "+config.Db.tablename+ " where `EMP_ID`= '"+data.empId+"' and `date`='"+data.date+"';"

        }
    }


}

module.exports= DbConnector;


//======================================== USAGE ======================================================//

// var Updaterecord={
//     "empid":36022,
//     "tempid":6,
//     "outTime":"13:04:00"
// }

// console.log(new DbConnector().queryGenerator("UPDATE",Updaterecord));


// var db=new DbConnector()
// var connection=db.CreateConnectionPool();

// // console.log(connection)

// connection.query("UPDATE `tempid`.`TS_EMP` SET `OUT_TIME`='21:40:00' WHERE `TEMPCARD_ID`='2' and`EMP_ID`='36022';", function (error, results, fields) {
//     if (error) throw error;
//     console.log('Results :', results);
//   });
    

    // connection.on('acquire', function (connection) {
    //     console.log('Connection %d acquired', connection.threadId);
    // });

    // connection.on('connection', function (connection) {
    //     console.log("connected");
    // });

    // connection.on('release', function (connection) {
    //     console.log('Connection %d released', connection.threadId);
    // });

    // UPDATE `tempid`.`TS_EMP` SET `OUT_TIME`='16:50:00' WHERE `TEMPCAD_ID`='1' and`EMP_ID`='36042';
    // INSERT INTO `tempid`.`TS_EMP` (`TEMPCARD_ID`, `EMP_ID`, `DATE`, `IN_TIME`, `OUT_TIME`, `RECOG`) VALUES ('2', '36022', '2018-08-26', '16:00:00', '17:00:00', 'y');


    // INSERT INTO `tempid`.`TS_EMP` (`EMP_ID`, `DATE`, `IN_TIME`, `OUT_TIME`, `RECOG`) VALUES ('36045', '2018-08-27', '10:00:00', '12:00:00', 'n');
