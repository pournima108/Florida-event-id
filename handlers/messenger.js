var request = require('request')
var config = require('../config')
const loggerConfiguration = require('../logger');
const logger = loggerConfiguration.loggerob;

class messenger {

    constructor() {

        logger.debug("messenger object created");

    }
    sendSms(to, callback) {
        logger.silly("inside sms module");
        var accountSid = process.env.accountSid; // Your Account SID from www.twilio.com
        var authToken = process.env.authToken;   // Your Auth Token from www.twilio.com
        var msg = "Onetime password (OTP) for your TPIN request over google assistant is 546700. this is usable once & valid for 15 mins from the request.PLEASE DO NOT SHARE WITH ANYONE."
        const client = require('twilio')(accountSid, authToken);
        client.messages.create({
            to: "+91" + to, // Text this number
            from: process.env.from, // From a valid Twilio number
            body: msg
        })
            .catch(function (err) {
                logger.error("ERROR from twilio msg api" + err);
            })
            .then((message) => {
                logger.debug("RESPONSE from twilio msg api" + message.sid + " " + message.status);
                callback(message);
            })

    }


    messenger247(toMobile, otp, callback) {
        logger.debug("Mobbile no and OTP entered by user" + toMobile + "" + otp)
        var options = {
            method: 'GET',
            url: 'https://smsapi.24x7sms.com/api_2.0/SendSMS.aspx',
            qs:
            {
                APIKEY: config.Sms247.apikey,
                MobileNo: toMobile,
                Message: `Your One Time Password for the Temporary ID Card generation is ${otp}. This is valid for 5 minutes. DO NOT SHARE WITH ANYONE. – Hexaware`,
                SenderID: config.Sms247.senderId,
                ServiceName: 'TEMPLATE_BASED'
            }
        }

        request(options, function (error, response, body) {
            if (error) {
                logger.error("Error from messenger 247 api" + error);
                callback(error, null)
            } else {
                logger.debug("response from sms247 api" + body)
                callback(null, body);
            }
        });


    }

}

module.exports = messenger;
