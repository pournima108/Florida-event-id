var mysql = require('mysql');


class DbDriver{

    constructor(){

        console.log("instantiating DbConnector ");

    }

    static CreateConnectionPool(){

        return mysql.createPool({
            connectionLimit : 5,
            host            : process.env.hostname,
            user            : process.env.username,
            password        : process.env.password,
            database        : process.env.database
          });
    
    }

    static CreateNewConnection(){

        return mysql.createConnection({
            host     : process.env.hostname,
            user     : process.env.username,
            password : process.env.password,
            database : process.env.dbname
          });

    }

    query(connection,sqlQuery,callback){
        
        connection.query(sqlQuery, function (error, results, fields) {
            if (error){
                console.log("Error processing query\n",error)
                callback(error,null);
            }else{
                console.log('Query Results: \n', results);
                callback(null,results);
            }
          
            
        });

    }

}

module.exports= DbDriver;

