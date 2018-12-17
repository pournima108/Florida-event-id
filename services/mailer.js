const nodemailer = require('nodemailer');
const loggerConfiguration = require('../logger');
var config = require('../config')
const logger = loggerConfiguration.loggerob;

class mailer{

    constructor(){

        logger.debug("INITIALIZING MAILING SERVICE");

    }

    Sendmail(receivers,ccReceivers,msg,sub,callback){


        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                    user: config.Mailcred.username,
                    pass: config.Mailcred.pass,
                }
            });


        let mailOptions = {
            from: '"SELF SERVICE" <htlp002@gmail.com>', // sender address for TELE2
            to: receivers, // list of receivers for TELE2
            subject: sub, // Subject line for TELE2
            cc:ccReceivers,
            html:msg,
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
            logger.error(`Error sending mail to ${receivers}`+error);
            callback(error,null)
            
            }else{
                logger.info(`Mail sent to ${receivers}`+ info.messageId+ " " + info.response);
                callback(null,info)
                
            }
        });
          

    }

}

module.exports = mailer;

// new Mailer().Sendmail(["abhishekda@hexaware.com","lohitkumarB@hexaware.com"],["pourabk@hexaware.com"]);