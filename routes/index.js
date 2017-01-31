var express = require('express');
var router = express.Router();
var fs = require('fs');
var jsonfile = require('jsonfile');
var csv = require('csv');
var csvWriter = require('csv-write-stream')

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('pre-instructions', {title : 'PRE-INSTRUCTIONS'} );
// });

router.get('/', function(req, res, next) {
  res.render('instructions', {title : 'INSTRUCTIONS'} );
});

router.get('/redirect-to-expt', function(req, res, next){
  file = "numbers.json"
  jsonfile.readFile(file, function(err, obj){
    if(obj) {
      console.log(obj);
      console.log(obj.array.length);
      console.log(obj.array[1].num);
      var bucket = [];
      for (var i=0;i<obj.array.length;i++) {
        console.log("i = ", i);
        for(var j=0;j<obj.array[i].num;j++) {
          bucket.push(i);
        }
      }
      console.log("BUCKET  ",bucket.length);
      var randomIndex = Math.floor(Math.random()*bucket.length);
      console.log("RANDOM INDEX",randomIndex);
      var currentIndex = bucket.splice(randomIndex, 1)[0];
      console.log("CURRENT INDEX",currentIndex);
      var goToURL;
      obj.array[currentIndex].num -= 1;

      jsonfile.writeFile(file, obj, function (err) {
        console.error(err)
      });

      switch(currentIndex) {
        case 0:
          goToURL = '/ctrl';
          res.redirect(goToURL);
          break;
        case 1:
          goToURL = '/1a';
          res.redirect(goToURL);
          break;
        case 2:
          goToURL = '/1b';
          res.redirect(goToURL);
          break;
        case 3:
          goToURL = '/1c';
          res.redirect(goToURL);
          break;
        case 4:
          goToURL = '/2a';
          res.redirect(goToURL);
          break;
        case 5:
          goToURL = '/2b';
          res.redirect(goToURL);
          break;
        case 6:
          goToURL = '/2c';
          res.redirect(goToURL);
      }
      console.log(obj[1]);

    } else {
      console.log("File not found. Creating file now");
      var obj = {
        "array": [
        {"num":100},
        {"num":100},
        {"num":0},
        {"num":100},
        {"num":100},
        {"num":0},
        {"num":100}
        ]};
      jsonfile.writeFile(file, obj, function (err) {
        console.error(err)
      })
    }

  });
});

router.get('/ctrl', function(req, res, next) {
  res.render('control', {title : 'SIGNUP', form : 'ctrl'} );
});

router.get('/1a', function(req, res, next) {
  res.render('condition-1-a', {title : 'SIGNUP', form : '1a'} );
});

router.get('/1b', function(req, res, next) {
  res.render('condition-1-b', {title : 'SIGNUP', form : '1b'} );
});

router.get('/1c', function(req, res, next) {
  res.render('condition-1-c', {title : 'SIGNUP', form : '1c'} );
});

router.get('/2a', function(req, res, next) {
  res.render('condition-2-a', {title : 'SIGNUP', form : '2a'} );
});

router.get('/2b', function(req, res, next) {
  res.render('condition-2-b', {title : 'SIGNUP', form : '2b'} );
});

router.get('/2c', function(req, res, next) {
  res.render('condition-2-c', {title : 'SIGNUP', form : '2c'} );
});

router.post('/pre-instructions', function(req, res, next){
  console.log(req.body);
  preInstructionsTime = req.body.preInstructionsTime;
});

router.post('/instructions', function(req, res, next){
  console.log(req.body);
  instructionsTime = req.body.instructionsTime;
});

router.post('/receive-form-data', function(req, res, next){
  console.log(req.body);

  req.session.formType = req.body['form-type'];
  req.session.firstName = req.body['first-name'];
  req.session.lastName = req.body['last-name'];
  req.session.timeStarted = req.body['time-started'];
  req.session.timeAccepted = req.body['time-accepted'];
  req.session.duration = (req.body['time-accepted'] - req.body['time-started'])/1000;
  req.session.isTNCclicked = req.body['is-tnc-clicked'];
  req.session.isDeclined = req.body['is-declined'];
  res.redirect('/quest');
});

router.get('/quest', function(req, res, next){
  res.render('questionnaire',{title : 'POST EXPT COMPREHENSION TEST'});
  console.log(req.session.form);
});

router.post('/receive-post-expt-data', function(req, res, next){
  console.log(req.session.form);
  console.log(req.body);
  var correctCount = 0;
  var correctAnswers = [2,3,1,1,3,4,2,3];
  for(var i = 0; i < correctAnswers.length; i++){
    if(correctAnswers[i] == req.body[String(i+1)]) {
      correctCount++;
    }
  }

  if (fs.existsSync('output.csv')) {
    console.log('Found file');
    var data = fs.readFileSync('output.csv');
    // console.log(data);
    var output =  req.session.formType + ',' +
                  req.body['uuid'] + ',' +
                  req.session.firstName + ',' +
                  req.session.lastName + ',' +
                  req.session.timeStarted + ',' +
                  req.session.timeAccepted + ',' +
                  req.session.duration + ',' +
                  req.session.isTNCclicked + ',' +
                  // req.session.isDeclined + ',' +
                  req.body['1'] + ',' +
                  req.body['2'] + ',' +
                  req.body['3'] + ',' +
                  req.body['4'] + ',' +
                  req.body['5'] + ',' +
                  req.body['6'] + ',' +
                  req.body['7'] + ',' +
                  req.body['8'] + ',' +
                  correctCount + '\n';

    fs.appendFile('output.csv', output, function (err) {

    });
  } else {
    console.log('File not found. Creating file');
    var writer = csvWriter();
    writer.pipe(fs.createWriteStream('output.csv'));
    writer.write({
      formType: req.session.formType,
      userID: req.body['uuid'],
      firstName: req.session.firstName,
      lastName: req.session.lastName,
      timeStarted: req.session.timeStarted,
      timeAccepted: req.session.timeAccepted,
      duration: req.session.duration,
      isTNCclicked: req.session.isTNCclicked,
      // isDeclined: req.session.isDeclined,
      q1:req.body['1'],
      q2:req.body['2'],
      q3:req.body['3'],
      q4:req.body['4'],
      q5:req.body['5'],
      q6:req.body['6'],
      q7:req.body['7'],
      q8:req.body['8'],
      correct: correctCount
    })
    writer.end()
  }

  res.redirect('/post-expt-quest');
});

router.get('/post-expt-quest', function(req, res, next){
  res.render('post-expt-questionnaire',{title : 'POST EXPT QUESTIONNAIRE'});
  console.log(req.session.form);
});

router.post('/receive-post-expt-quest-data', function(req, res, next){
  console.log(req.session.form);
  console.log(req.body);

  req.session.uuid = req.body['uuid'];

  if (fs.existsSync('questionnaire.csv')) {
    console.log('Found file');
    var data = fs.readFileSync('questionnaire.csv');
    // console.log(data);
    var output =  req.body['uuid'] + ',' +
                  req.body['1'] + ',' +
                  req.body['1a'] + ',' +
                  req.body['2'] + ',' +
                  req.body['2a'] + ',' +
                  req.body['3a'] + ',' +
                  req.body['3b'] + ',' +
                  req.body['3c'] + ',' +
                  req.body['3d'] + ',' +
                  req.body['4a'] + ',' +
                  req.body['4b'] + ',' +
                  req.body['4c'] + ',' +
                  req.body['4d'] + ',' +
                  req.body['pre-instructions-time'] + ',' +
                  req.body['instructions-time'] + ',' +
                  req.body['comprehension-time'] + ',' +
                  req.body['post-expt-quest-time'] + '\n';

    fs.appendFile('questionnaire.csv', output, function (err) {

    });
  } else {
    console.log('File not found. Creating file');
    var writer = csvWriter();
    writer.pipe(fs.createWriteStream('questionnaire.csv'));
    writer.write({
      uuid:req.body['uuid'],
      q1:req.body['1'],
      q1b:req.body['1b'],
      q2:req.body['2'],
      q2b:req.body['2b'],
      q3a:req.body['3a'],
      q3b:req.body['3b'],
      q3c:req.body['3c'],
      q3d:req.body['3d'],
      q4a:req.body['4a'],
      q4b:req.body['4b'],
      q4c:req.body['4c'],
      q4d:req.body['4d'],
      preInstructionsTime:req.body['pre-instructions-time'],
      instructionsTime:req.body['instructions-time'],
      comprehensionTime:req.body['comprehension-time'],
      postExptQuestionnaireTime:req.body['post-expt-quest-time']
    })
    writer.end()
  }

  res.redirect('/end');
});


router.get('/end', function(req, res, next){
  res.render('thanks', {pageData: {code : req.session.uuid}});
  console.log(req.session.form);
});

module.exports = router;
