var messenger = require('../handlers/messenger')
var mailer = require('./mailer')
var fs = require('fs')
const loggerConfiguration = require('../logger');
const logger = loggerConfiguration.loggerob;

class otpService {

    constructor() {
        if (!fs.existsSync("./otpVault")) {
            fs.mkdirSync("./otpVault");

            fs.writeFile('./otpVault/otpregister.json', "[]", (err) => {
                if (err) {
                    logger.error("Error in creating otpregister" + err);
                } else {
                    logger.info("OTP register created");
                }
            });

        }
    }

    generator(data, callback) {
        logger.info("Generating OTP for " + data.response.employeeid + " mobile: " + data.response.ipagedetails_official_info[0].mobile);
        let otp = Math.floor(100000 + Math.random() * 900000)
        if (data.response.ipagedetails_official_info[0].mobile != "") {
            fs.readFile("OtpVault/otpregister.json", (err, fileData) => {
                if (err) {
                    logger.error("error Reading OTP register" + err);
                    callback(err, null);
                } else {
                    try {
                        var otpList = JSON.parse(fileData.toString());

                        new messenger().messenger247(data.response.ipagedetails_official_info[0].mobile, otp, (err, data1) => {
                            if (err) {
                                logger.error("Error sending otp to" + data.response.ipagedetails_official_info[0].mobile);
                                callback(err, null);
                            } else {

                                otpList.push({ "empid": data.response.employeeid, "otp": otp });

                                fs.writeFile('./otpVault/otpregister.json', JSON.stringify(otpList), (err) => {
                                    if (err) {
                                        logger.error("error in writing OTP register " + err);

                                    } else {
                                        logger.debug("OTP generation process succeded for" + data.response.employeeid);

                                    }
                                });
                                logger.info("OTP sent to :" + data.response.employeeid, data.response.ipagedetails_official_info[0].mobile);
                                                           }
                        });

                        new mailer().Sendmail(data.response.ipagedetails_official_info[0].employeeemail, '', ` Your One Time Password for Temporary ID Card generation is ${otp}. This is valid for 5 minutes. DO NOT SHARE WITH ANYONE. - Hexaware`, "Temporary id OTP",(err, data2) => {
                            if (err) {
                                logger.error("Error sending otp to" + data.response.ipagedetails_official_info[0].employeeemail);
                                callback(err, null);
                            } else {
                                logger.info("OTP sent to :" + data.response.employeeid, data.response.ipagedetails_official_info[0].employeeemail);
                                // callback(null, { "contactMode": data.response.ipagedetails_official_info[0].employeeemail, "otp": otp, "Mode": `Email` });
                            }
                        })
                        callback(null, { "contactMode": data.response.ipagedetails_official_info[0].mobile+data.response.ipagedetails_official_info[0].employeeemail, "otp": otp, "Mode": `Mobile and Email` });


                    } catch (e) {
                        logger.error("JSON data curupted ,cannot validate otp");
                        callback("file corupted", null);

                    }
                }

            })
        } else if(data.response.ipagedetails_official_info[0].mobile == "" &&  data.response.ipagedetails_official_info[0].employeeemail != "") {
            fs.readFile("OtpVault/otpregister.json", (err, fileData) => {
                if (err) {
                    logger.error("error Reading OTP register" + err);
                    callback(err, null);
                } else {
                    try {
                        var otpList = JSON.parse(fileData.toString());
                        new mailer().Sendmail(data.response.ipagedetails_official_info[0].employeeemail, '', ` Your One Time Password for Temporary ID Card generation is ${otp}. This is valid for 5 minutes. DO NOT SHARE WITH ANYONE. - Hexaware`, "Temporary id OTP",(err, data2) => {
                            if (err) {
                                logger.error("Error sending otp to" + data.response.ipagedetails_official_info[0].employeeemail);
                                callback(err, null);
                            } else {
                                otpList.push({ "empid": data.response.employeeid, "otp": otp });

                                fs.writeFile('./otpVault/otpregister.json', JSON.stringify(otpList), (err) => {
                                    if (err) {
                                        logger.error("error in writing OTP register " + err);

                                    } else {
                                        logger.debug("OTP generation process succeded for" + data.response.employeeid);

                                    }
                                });
                                logger.info("OTP sent to :" + data.response.employeeid, data.response.ipagedetails_official_info[0].employeeemail);
                                callback(null, { "contactMode": data.response.ipagedetails_official_info[0].employeeemail, "otp": otp, "Mode": `Email` });
                            }
                        });
                    } catch (e) {
                        logger.error("JSON data curupted ,cannot validate otp");
                        callback("file corupted", null);

                    }
                }
            })
        }
        else if(data.response.ipagedetails_official_info[0].mobile == "" &&  data.response.ipagedetails_official_info[0].employeeemail == "") {
            logger.info("Neither Mobile no. nor email id is present")
            callback(null, { "contactMode": "None", "otp":"None", "Mode": `None`})

        }
    }

    otpValidator(employeeid, otp, callback) {

        logger.info("Validating OTP for" + employeeid + "" + otp);
        fs.readFile('./otpVault/otpregister.json', (err, filedata) => {
            if (err) {
                logger.err("FAILED to read OTP register" + err)
                logger.warn("Cannot validate OTP")
                callback(err, null);

            } else {

                var otpData = JSON.parse(filedata.toString())
                for (var ele = 0; ele < otpData.length; ele++) {

                    if (otp == otpData[ele].otp) {
                        logger.debug(`Entered OTP matched : ${otp}`)
                        callback(null, otpData[ele].otp);
                        break;
                    }
                    else {
                        if (otpData.length - 1 == ele) {
                            logger.info(`Entered OTP did not matched : ${otp}`)
                            callback(null, "not matched")
                        }

                    }
                }
            }

        })

    }
}
module.exports = otpService

