var tracker = require('./tracker')
var empService = require('../services/empService');
var moment = require('moment');
var awsrek = require('../services/awsRek')
var pjson = require('../package.json');
var trackerOB = new tracker();
var dbConnector = require("./dbConnector")
var dbquery = require("./dbRestHandler")
const loggerConfiguration = require('../logger');
var otpService = require('../services/otpService')
const logger = loggerConfiguration.loggerob;

var defaulterflag = true;


class controller {


    /*
         Function to call recognize api of aws
    */
    recognizer(req, res) {

        var formatedDate = moment(new Date()).format('YYYY.MM.DD');
        var pastdate = moment(new Date()).subtract(1, 'days').format('YYYY.MM.DD');
        var target_image = req.body.myImage;
        

        awsrek.Recognize(target_image, (err, rekdata) => {

            if (err) {
                logger.warn("Error gettting results from Aws Rekognition" + err)
                res.render('error');

            } else if (rekdata.status != 500 && rekdata.results.FaceMatches.length > 0) {
                var facedata = rekdata.results
                var facevalue = JSON.stringify(facedata.FaceMatches[0].Face.FaceId)
                // code to   query  from  database
                new dbquery().getResults(facevalue, (err, empid) => {
                    if (err) {
                        logger.warn("Error from dbquery get results " + err)
                        res.render('error')
                    }
                    else {
                        logger.debug("empid from dbquery" + JSON.stringify(empid))
                        var emp_id;
                        if (empid.length <= 0) {
                            emp_id = rekdata.results.FaceMatches[0].Face.ExternalImageId
                        }
                        else {
                            emp_id = empid
                        }
                        logger.debug("Employee id from dbquery given to empdetails" + emp_id)
                        logger.debug("External image ID", rekdata.results.FaceMatches[0].Face.ExternalImageId)
                        empService.GetEmpDetails(emp_id, (err, emplist) => {
                            if (err) {
                                logger.warn("Error gettting results from Emp Service" + err)
                                res.render('error');

                            } else if (emplist.ipagedetails_official_info.length <= 0) {
                                logger.warn("Your details are not updated in the stationh: " + rekdata.results.FaceMatches[0].Face.ExternalImageId)
                                res.render('noDetailsAvailable', {
                                    subject: rekdata.results.FaceMatches[0].Face.ExternalImageId,
                                    image: target_image,
                                    pjson: pjson
                                })
                            } else {


                                logger.info(`Image :${rekdata.file_reference} is recognised. External Image ID :${rekdata.results.FaceMatches[0].Face.ExternalImageId} FaceId: ${facedata.FaceMatches[0].Face.FaceId}`)
                                if (rekdata.results.FaceMatches[0].Face.ExternalImageId == emplist.ipagedetails_official_info[0].employeeid.trim()) {
                                    logger.silly("EMP details" + emplist.ipagedetails_official_info[0])
                                    logger.info("Emp details received for   : " + emplist.ipagedetails_official_info[0].employeeid)
                                    res.render('welcomeCard', {

                                        details: emplist.ipagedetails_official_info[0],
                                        image: target_image,
                                        imagepath: rekdata.file_reference,
                                        date: formatedDate,
                                        defaulterflag: defaulterflag,
                                        pjson: pjson

                                    });


                                } else {
                                    logger.info("No details found for " + rekdata.results.FaceMatches[0].Face.ExternalImageId)
                                    res.render('noDetailsAvailable', {
                                        subject: rekdata.results.FaceMatches[0].Face.ExternalImageId,
                                        image: target_image,
                                        pjson: pjson
                                    })


                                }

                            }
                        })
                    }
                })
            }
            else if (rekdata.results.message == 'There are no faces in the image. Should be at least 1.') {
                logger.warn("There are no faces in the image. Please put face and try again")
                res.render('index_old', {
                    pjson: pjson,
                    msg: 'There are no faces in the image. Please put your face and try again',

                });

            } else {
                logger.silly("Results from recognize api when face is not recognized " + rekdata.results)
                logger.info("Employee face is not recognized ,So fill your data")
                res.render('fillData', {
                    image: target_image,
                    imagepath: rekdata.file_reference,
                    msg: "",
                    pjson: pjson

                });

            }



        })

    }

    /*
         Function to enroll photo with employee id  using aws rek api when face is not recognized  
    */
    faceIndexer(req, res) {

        new otpService().otpValidator(req.body.employeedata, req.body.otp, (err, data) => {
            if (err) {
                logger.warn("ERROR from OTP validator" + err)
                res.render('error')
            } else if (data == "not matched") {
                logger.debug("Response from otp validator function" + JSON.stringify(data))
                res.render('filldata', {
                    image: req.body.imageData,
                    imagepath: req.body.imagepath,
                    msg: "Wrong OTP.Please enter OTP again",
                    pjson: pjson

                })
            } else if (data == req.body.otp) {
                logger.info("OTP successfully validated for " + req.body.employeedata)
                var formatedDate = moment(new Date()).format('YYYY.MM.DD');
                var d = new Date(); // for now 
                var currenTimestamp = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
                logger.debug("Enrolling the employee id  " + req.body.employeedata + " with image path as " + req.body.imagepath);

                awsrek.Enroll(req.body.imagepath, req.body.employeedata.trim(), (err, data) => {

                    if (err) {
                        logger.warn(`Error in indexing face of ${req.body.employeedata}`, err)
                        res.render('error')

                    } else if (data.results.FaceRecords.length > 0) {

                        logger.debug("Face id after indexing of faces" + data.results.FaceRecords[0].Face.FaceId)

                        var Empdetails = {
                            employeeid: req.body.employeedata,
                            employeename: req.body.employeename,
                            mobile: req.body.mobile,
                            department: req.body.department,
                            building: req.body.building,
                            employeeemail: req.body.employeeemail
                        }

                        logger.info(`Face is indexed of ${req.body.employeedata}`);
                        new dbquery().insertData(req.body.employeedata, data.results.FaceRecords[0].Face.FaceId, (err, insertData) => {
                            if (err) {
                                logger.error("ERROR IN INSERTING IN DB FOR INDEXING FACES " + err)
                            }
                            else {
                                logger.debug("DATA SUCCESSFULLY INSERTED IN DB FOR INDEXING FACES" + req.body.employeedata + "  " + data.results.FaceRecords[0].Face.FaceId + " " + insertData)
                            }
                        })


                        trackerOB.recordDefaulter({ "empId": req.body.employeedata, "date": formatedDate, "intime": currenTimestamp }, (err, recorddefaulterresult) => {
                            if (err) {
                                logger.error("ERROR WHILE RECORDING DATA IN DB" + err)
                                res.render('error');
                            } else {
                                //code to insert in database
                                logger.info("ID CARD PRINTED AND DATA RECORED IN DB FOR " + req.body.employeedata + "  at  " + currenTimestamp)
                                res.render('response', {
                                    details: Empdetails,
                                    image: req.body.imageData,
                                    date: formatedDate,
                                    pjson: pjson

                                });
                            }

                        })
                    } else {

                        res.render('error');

                    }

                })
            }
        })

    }

    /*
         Function to render the filldata page
    */
    userValidator(req, res) {
        var image = req.body.imageData;//image
        var imagepath = req.body.imagepath//s3 image path
        res.render('fillData', {

            image: image,
            imagepath: imagepath,
            msg: "",
            pjson: pjson

        })

    }




    /*
         Function to print the id card
    */
    giveResponse(req, res) {

        var formatedDate = moment(new Date()).format('YYYY.MM.DD');
        var d = new Date(); // for now 
        var currenTimestamp = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()

        if (process.env.autolearn == "true") {
            awsrek.Enroll(req.body.imagepath, req.body.employeeid.trim(), (err, body) => {
                logger.debug("Enroll body : " + JSON.stringify(body));
                if (err) {
                    logger.warn("error" + err)
                }
                else {
                    logger.info("Updated recent face details  of " + req.body.employeeid + "in aws collection")
                    // logger.info(body.results);
                    logger.info("face record" + body.results.FaceRecords[0].Face.FaceId)
                    new dbquery().insertData(req.body.employeeid, body.results.FaceRecords[0].Face.FaceId, (err, insertData) => {
                        if (err) {
                            logger.error("ERROR IN INSERTING IN DB FOR INDEXING FACES " + err)
                        }
                        else {
                            logger.info("Updated recent face details  of " + req.body.employeeid + "in db")
                        }
                    })

                }
            })

        }



        var Empdetails = {
            employeeid: req.body.employeeid,
            employeename: req.body.employeename,
            mobile: req.body.mobile,
            department: req.body.department,
            building: req.body.building,
            employeeemail: req.body.employeeemail
        }


        //recording ID card generation 
        trackerOB.recordDefaulter({ "empId": req.body.employeeid, "date": formatedDate, "intime": currenTimestamp }, (err, data) => {
            if (err) {
                logger.error("ERROR RECORDING TO DB " + err)
                res.render('error');
            } else {
                logger.info('ID CARD PRINTED AND DATA INSERTED IN DB FOR ' + req.body.employeeid + "  at  " + currenTimestamp)
                res.render('response', {

                    details: Empdetails,
                    date: formatedDate,
                    image: req.body.imageData

                });

            }


        })




    }


    /*
         Update outtime  
    */
    updateOutTime(req, res) {
        var connectorOB = new dbConnector()

        logger.debug(connectorOB.queryGenerator("UPDATE", { "date": req.body.date, "empid": req.body.empid, "outTime": req.body.outtime }));
        connectorOB.query(connectorOB.CreateNewConnection(), connectorOB.queryGenerator("UPDATE", { "date": req.body.date, "empid": req.body.empid, "outTime": req.body.outtime }), (err, response) => {

            if (err) {
                logger.error("ERROR IN UPDATE OUT TIME" + err)
                res.send(err);
            } else {
                logger.info("OUTTIME SUCCESSFULLY UPDATED for " + req.body.empid)
                res.send(response);
            }

        });


    }

    /*
         Update Employee photo to stationh using stationh api.
    */
    uploadEmployeePhoto(req, res) {
        empService.PostEmpDetails(req.body.wmpid, req.body.image, (error, data) => {
            if (error) {
                logger.error("ERROR IN UPDATE EMPLOYEE PHOTO" + error)
                res.send(error)
            } else {
                logger.info("EMPLOYEE PHOTO SUCCESSFULLY UPDATED" + req.body.empid)
                res.send(data)
            }
        })

    }
}


module.exports = controller