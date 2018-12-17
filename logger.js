var winston = require('winston');
require('winston-daily-rotate-file')
"use strict"
var loggerConfig = {
  "loggerob": winston.createLogger({

    transports: [

      // colorize the output to the console

      new winston.transports.Console({

        name: 'Monitoring',

        level: process.env.environment === 'monitoring' ? 'silly' : 'OFF',

        colorize: winston.format.colorize(),

        prettyPrint: winston.format.prettyPrint(),

        // raw: winston.format.json(),  

        format: winston.format.simple(),

        timestamp: winston.format.timestamp(),

      }),

      new winston.transports.Console({

        name: 'Development',

        level: process.env.environment === 'dev' ? 'debug' : 'OFF',

        colorize: winston.format.colorize(),

        prettyPrint: winston.format.prettyPrint(),

        // raw: winston.format.json(),  

        format: winston.format.simple(),

        timestamp: winston.format.timestamp(),



      }),



      new winston.transports.DailyRotateFile({

        name: 'Production',

        level: process.env.environment === 'prod' ? 'info' : 'OFF',

        filename: `logs/TempId-prod-%DATE%.log`,

        prettyPrint: winston.format.prettyPrint(),

        format: winston.format.simple(),

        timestamp: winston.format.timestamp(),

        maxsize: '5mb',

        zippedArchive: true,

        maxFiles: '10d'

      }),



      new winston.transports.DailyRotateFile({

        name: 'UAT/QA',

        level: process.env.environment === 'uat/qa' ? 'info' : 'OFF',

        filename: `logs/TempId-stage-%DATE%.log`,

        prettyPrint: true,

        timestamp: true,

        maxsize: '5mb',

        zippedArchive: true,

        maxFiles: '10d'


      })

    ]

  })



}



module.exports = loggerConfig;

