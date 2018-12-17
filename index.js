var express = require('express');
var bodyParser = require('body-parser');
var checkDefaulter = require('./handlers/tracker')
var config = require('./config')
var route = require('./routes/routes');
var dbDriver= require('./handlers/dbConnector')
const loggerConfiguration =require('./logger');
const logger= loggerConfiguration.loggerob;
var mailer = require('./services/mailer')

// var dbroutes = require('./routes/dbroutes');

//Express Object Instantiated
var app = express();

app.set('view engine', 'ejs');

//Dynamic PORT allocation
var port = process.env.PORT || 3000;

//Express Config
app.use(express.static(__dirname))
app.use(express.static(__dirname+"/public"));
app.use(bodyParser.json({ limit: '100mb',extended: true }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

// //Db connection check
var connection=dbDriver.CreateNewConnection();
connection.connect((err,data)=>{
    logger.info("Testing Db connection ")
    if(err){
        logger.error("Failed to connect to DB ABORTING\n",err)
        process.exit();
    }else{
        logger.info('DB Connection established')
        connection.end((err,data)=>{
            if(err==null){
                logger.info('Terminating test connection');
            }
        })
    }
})
// ================================================
connection.on('connect',()=>{
    logger.debug("Connected to DB")
})
connection.on('end',()=>{
    logger.debug('Connection ended');
})
connection.on('error', function(err) {
    logger.error("DB ERROR",err.code); 
});

//=========Uncaught Exception handling======// 
process.on('uncaughtException', (err)=> {

    logger.warn("Uncaught Exceptions"+err.stack); 
    var msg =err.stack.toString()


    // new mailer().Sendmail('AbhishekDa@hexaware.com', 'PournimaM@hexaware.com',msg,"Temorary id Appplication crashed", (error, data2) => {
    //     if (error) {
    //         logger.error("Error sending mail to AbhishekDa@hexaware.com" +error);
    //     } else {
    //         logger.info("Mail sent sucessfully" + 'AbhishekDa@hexaware.com');
            
            
    //     }
    // })
    

    
})


//Routes
app.use('/', route);
//==================================================

if (process.env.mode == '' || process.env.gallery == '' || process.env.autolearn == '' || process.env.empdatasource == '') {

    logger.silly(` MODE: ${process.env.mode} \n GALLERY: ${process.env.gallery} \n EMPLOYEE DATA SOURCE: ${process.env.empdatasource} \n Autolearn: ${process.env.autolearn}\n`)
    logger.silly(`ISGempApi: ${config.ISGempApi.empServiceUrl}`)
    logger.silly(`Rekognition: ${config.Rekognition.Url}`)
    logger.silly(`Sms247 senderID: ${config.Sms247.senderId}`)
    logger.warn("please enter the environment variables");

} else {

    app.listen(port,()=>{
        logger.silly(` MODE: ${process.env.mode} \n GALLERY: ${process.env.gallery} \n EMPLOYEE DATA SOURCE: ${process.env.empdatasource} \n Autolearn: ${process.env.autolearn}\n`)
        logger.silly(` ISGempApi: ${config.ISGempApi.empServiceUrl}`)
        logger.silly(` Rekognition: ${config.Rekognition.Url}`)
        logger.silly(` Sms247 senderID: ${config.Sms247.senderId}`)
        logger.silly(" Db connection"+process.env.dbconnection)
    
        if(process.env.dbconnection=="false"){

            new checkDefaulter().createRegister()

        }
        logger.info("Checking all env variables ......... OK! \n      Starting server")
        logger.info("Server listening at port " + port);

    });
    
}


