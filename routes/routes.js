var express = require('express');
var router = express.Router();
var methods = require('../handlers/controller');
var sendMail = require('../services/mailer')
var getEmpjson = require('../services/empService')
var otpService = require('../services/otpService')
var pjson = require('../package.json');
const loggerConfiguration =require('../logger');
const logger= loggerConfiguration.loggerob;

//Package Dependencies

var response = new methods()

 /*
   Get the first page
 */
router.get('/', function (req, res) {
  res.render('index', {
    pjson: pjson
  });
});

  /*
      Get the Camera page
  */
router.get('/getdata', (req, res) => {
  res.render('index_old',{
    msg:'',
    pjson : pjson
  })
})


  /*
      Post photos in collection by calling the enroll api
 */
router.post('/enroll', function (req, res) {
  response.faceIndexer(req, res)
})  

 /*
      Call the recognize function.
  */
router.post('/upload', function (req, res) {
  response.recognizer(req, res)
})


 /*
      Call the give response method .
  */
router.post('/response', function (req, res) {
  response.giveResponse(req, res)
})


 /*
      Call the filldata page.
 */
router.post('/fillData', function (req, res) {
  response.userValidator(req, res)
})




 /*
      Call the No Details available page.
 */
router.get('/noDetailsAvailable', function (req, res) {
  res.render('noDetailsAvailable', {
    pjson: pjson
  });
})



  /*
     Call Send Email function
  */
router.get('/sendMail/:mail', (req, res) => {
  logger.debug("Entering Mail endpoint : " + req.params.mail)
  var mail = new sendMail().Sendmail(req.params.mail, 'PournimaM@hexaware.com',"I want to raise a request for new id",(err,data)=>{
    if(err){
      logger.warn("Error from Emp API : " + err)
      res.status(400).json(err)

    }
    else{
      var response = "mail sent sucessfully"
      logger.debug("mail is: " + JSON.stringify(mail))
      res.status(200).json(data)
    }
  })
  
})



  /*
     Call get  Employee Json function
  */
router.get('/getEmpjson/:id', (req, res) => {
  logger.debug("Entering get Empdetails endpoint : " + req.params.id)
  getEmpjson.GetEmpDetails(req.params.id, (err, body) => {
    if (err) {
      logger.warn("Error from Emp API : " + err)
      res.status(400).json(err)
    }
    else {
      logger.debug("EMP details retrieved succesfully for " +req.params.id)
      res.status(200).json(body)
    }

  })

})

  /*
   Send error page endpoint
  */
router.get('/error',(req,res) =>{
  logger.debug("error page")
   res.render('error')
})

  /*
     Call get  Send mail or sms  function
  */
router.post('/sendMailSms', (req, res) => {

  new otpService().generator(req.body,(err,data)=>{
    if(err){
      logger.warn("ERROR from OTP generator"+err)
      res.status(400).json(err)
    } else{
      logger.debug("Response from sms send : " + JSON.stringify(data))
      res.status(200).json(data)
    }
  })
})

  /*
     Call get otp validator function.
  */
router.post('/otpvalidator',(req,res)=>{
  
  
  new otpService().otpValidator(req.body.result.employeeid,req.body.result.otp,(err,data)=>{
    if(err){
      logger.warn("ERROR from OTP validator"+err)
      res.status(400).json(err)
    } else {
      logger.debug("Response from otp validator function" +JSON.stringify(data))
      res.status(200).json(data)
    }
  })
})


  /*
     Call checkout  function.
  */
router.post('/checkout', (req, res) => {

  response.updateOutTime(req,res);

})

  /*
     Call update photo to stationh function
  */
 router.post('/uploadtoStationh',(req, res) => {

    response.uploadEmployeePhoto(req, res);
     
 })


module.exports = router;