var request = require('request')
var config = require('../config')
const loggerConfiguration =require('../logger');
const logger= loggerConfiguration.loggerob;

module.exports = {
    
    'Recognize': function (img, callback) {
        
        options = {
            method: 'POST',
            url: config.Rekognition.Url+"query",
            body: {
                image: img,
                gallery: process.env.gallery
            },
            json: true
        };
        request(options, function (error, response, body) {
            if (error || response.status == 500 || response.status == 404) {
                logger.error("Error in calling Rekog Searchface API : " + error)
                if (error) {
                    callback(error, null);
                } else {
                    logger.error(+body)
                    callback(response.status, null);
                }
            }
            else {
                logger.debug("Rekognition Searchface API Response : " + JSON.stringify(body))
                callback(null, body)
            }

        })
    },

    'Enroll': function (imagepath, subjectid, callback) {
        logger.debug("Indexing face of "+subjectid);
        options = {
            method: 'POST',
            url: config.Rekognition.Url+"train",
            body: {
                path: imagepath,
                empId: subjectid,
                gallery: process.env.gallery
            },
            json: true
        };
        request(options, function (error, response, body) {
            if (error) {
                logger.error("Error in calling Rekog Indexface API : " + JSON.stringify(error))
                callback(error, null)
            }
            else {
                logger.debug("Rekognition Indexface API Response : " + JSON.stringify(response.body))
                callback(null, body)
            }

        })
    }
}