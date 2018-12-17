var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
var fs = require('fs');


var textToSpeech = new TextToSpeechV1({
  iam_apikey: 'n0fxt4rrHzp5MHsS5KTo13oLlP713DIrPgCZusAkmIe_',
  url: 'https://gateway-syd.watsonplatform.net/text-to-speech/api'
});

// var getVoiceParams = {
//     voice: 'en-US_AllisonVoice'
//   };
  
//   textToSpeech.getVoice(getVoiceParams, function(error, voice) {
//     if (error) {
//       console.log(error);
//     } else {
//       console.log(JSON.stringify(voice, null, 2));
//     }
//   });
var synthesizeParams = {
    text: <speak version="1.0">
                Hello welocome to the event <mark name="Pournima"/> world.
              </speak>,
    accept: 'audio/wav',
    voice: 'en-US_AllisonVoice'
  };

textToSpeech
  .synthesize(synthesizeParams, function(err, audio) {
    if (err) {
      console.log(err);
      return;
    }
    textToSpeech.repairWavHeader(audio);
    fs.writeFileSync('audio.wav', audio);
    console.log()
    console.log('audio.wav written with a corrected wav header');
});  