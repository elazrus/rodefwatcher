console.log('The bot is starting');

// node import statement 
var Twit = require('twit');
var config = require('./config');
var exec = require('child_process').exec;
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var Canvas = require('canvas');

var T = new Twit(config);
//var Image = Canvas.Image;
var cmd = 'processing-java --sketch=`pwd`/imageCreator --run';
var url = 'http://www.mfa.gov.il/mfa/foreignpolicy/terrorism/palestinian/pages/victims%20of%20palestinian%20violence%20and%20terrorism%20sinc.aspx';

var signs = ['1.jpg','2.png','3.jpg','4.jpeg','5.PNG','6.jpg','7.png'];
var sign_fonts = ['24px Impact', '48px Impact', '32px Impact', '22px Impact', '124px Impact', '24px Impact', '96px Impact'];
var sign_coords = [[135,167], [160,110], [105,218], [48,154], [700,1170], [65,130], [275,445]];

var tweeted_fn = "tweetedDates.txt";
var tweeted2_fn = "tweetedOffDates.txt";

function tweet() {
  // parse webpage - code help from DigitalOcean (www.digitalocean.com/community/tutorials/how-to-use-nodejs-request-and-cheerio-to-set-up-simple-web-scraping)
  request(url, function(error, response, html) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
   
      var dates = [];

      $('p').each(function(i, element) {
        var attack = $(this).text();
      
        var re = {
          date: /((Jan)|(Feb)|(Mar)|(Apr)|(May)|(Jun)|(Jul)|(Aug)|(Sep)|(Oct)|(Nov)|(Dec))([A-Za-z]*)(\s+)([0-9])([0-9]{0,1})(,)(\s+)([0-9]{4})/
        }
      
        if (re.date.test(attack)) {
          var date = re.date.exec(attack)[0];
          date = date.split(' ');
          if   ((/Jan/).test(date[0])) date[0] =  1;
          else if ((/Feb/).test(date[0])) date[0] =  2;
          else if ((/Mar/).test(date[0])) date[0] =  3;
          else if ((/Apr/).test(date[0])) date[0] =  4;
          else if ((/May/).test(date[0])) date[0] =  5;
          else if ((/Jun/).test(date[0])) date[0] =  6;
          else if ((/Jul/).test(date[0])) date[0] =  7;
          else if ((/Aug/).test(date[0])) date[0] =  8;
          else if ((/Sep/).test(date[0])) date[0] =  9;
          else if ((/Oct/).test(date[0])) date[0] = 10;
          else if ((/Nov/).test(date[0])) date[0] = 11;
          else if ((/Dec/).test(date[0])) date[0] = 12;
          date[1] = date[1].replace(',', '');
          date = new Date(Date.UTC(date[2], date[0], date[1], 0, 0, 0, 0));

          dates.push(date.toDateString());
        }
        else {
          console.log(error);
        }
      });
    
      fs.exists(tweeted_fn, function(exists) {
        if (!exists) {
          fs.writeFile(tweeted_fn, dates[0] + '', function(err) {
            fs.writeFile(tweeted2_fn, '', function(err) {
              var tweet = dates[0] + ": 0 days since last Palestinian terrorist attack in Israel.";
              tweetImages([tweet]);
            });
          });
        }
        else {
          fs.readFile(tweeted_fn, 'utf8', function(err, data) {
          
            if (err) throw err;
          
            fs.readFile(tweeted2_fn, 'utf8', function(err2, data2) {
          
              var tweeted_dates = data.split('\n');
              var last_date = new Date(tweeted_dates[tweeted_dates.length-1]);
            
              var tweeted_offdates, last_offdate;
              if (data2.length > 0) {
                tweeted_offdates = data2.split('\n');
                last_offdate = new Date(tweeted_offdates[tweeted_offdates.length-1]);
              }
          
              var new_date = null;
              for (var i=0; i < dates.length; i++) {
                if (dates[i] == tweeted_dates[i]) continue;
                else {
                  new_date = dates[i];
                  break;
                }
              }
          
              if (new_date) {
            
                if (err2) throw err2;
              
                  var tweets = [];
                  var tweetPrev = true;

                  new_date = new Date(Date.parse(new_date));
              
                  var prev_date = new Date(new_date);
                  prev_date.setDate(prev_date.getDate() - 1);  
                  
                  if (last_offdate && prev_date.getTime() == last_offdate.getTime()) tweetPrev = false;
            
                  if (tweetPrev) {
                    if (data2.length > 0) data2 += '\n';
                    data2 += prev_date.toDateString();
                
                    fs.writeFile(tweeted2_fn, data2 + '', function(err) {
                      var oneDay = 1000 * 60 * 60 * 24;
                      var utc1 = Date.UTC(last_date.getFullYear(), last_date.getMonth(), last_date.getDate());
                      var utc2 = Date.UTC(prev_date.getFullYear(), prev_date.getMonth(), prev_date.getDate());
                      var num_days = Math.floor((utc2 - utc1) / oneDay);
                  
                      prev_date = prev_date.toDateString();
                      tweets.push(prev_date + ": " + num_days + " days since last Palestinian terrorist attack in Israel.");
                    });
                  }
              
                  new_date = new_date.toDateString();
                  data += '\n' + new_date;
 
                  fs.writeFile(tweeted_fn, data + '', function(err) {
                    tweets.push(new_date + ": 0 days since last Palestinian terrorist attack in Israel.");
                    tweetImages(tweets);
                  });
              
              }
              else {
                var tweets = [];
                var tweetToday = true;

                var today_date = new Date();

                if (last_offdate && today_date.getTime() == last_offdate.getTime()) tweetToday = false;

                if (tweetToday) {
                    if (data2.length > 0) data2 += '\n';
                    data2 += today_date.toDateString();

                    fs.writeFile(tweeted2_fn, data2 + '', function(err) {
                      var oneDay = 1000 * 60 * 60 * 24;
                      var utc1 = Date.UTC(last_date.getFullYear(), last_date.getMonth(), last_date.getDate());
                      var utc2 = Date.UTC(today_date.getFullYear(), today_date.getMonth(), today_date.getDate());
                      var num_days = Math.floor((utc2 - utc1) / oneDay);

                      today_date = today_date.toDateString();
                      tweets.push(today_date + ": " + num_days + " days since last Palestinian terrorist attack in Israel.");
                    });
                  }
              }
            });
          });
        }
      });
    }
  });
}

// tweet with image - code help from Dan Shiffman
function tweetImages(tweets) {
  var i = Math.min(Math.floor(Math.random() * signs.length), signs.length-1);

  fs.readFile('data/' + signs[i], function(err, data) {
    if (err) throw err;
    
    var filename = 'output.png';
    var img = new Canvas.Image; // Create a new Image
    img.src = data;

    // Initialiaze a new Canvas with the same dimensions
    // as the image, and get a 2D drawing context for it.
    var canvas = new Canvas(img.width, img.height);
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);

    var full_tweet = tweets[0];
    var num_days = tweets[0].match(/(\d+)(\s)(days)/)[0];
    num_days = num_days.replace(" days", "");

    ctx.font = sign_fonts[i];
    ctx.textAlign = 'right';
    ctx.fillText(num_days, sign_coords[i][0], sign_coords[i][1]);

    fs.writeFile(filename, canvas.toBuffer(), function(err) {
      var params = {
        encoding: 'base64'
      }
      var content = fs.readFileSync(filename, params);
      var media = {
        media_data: content
      }

      function uploaded(err, data, response) {
      
        if (err) console.log('Something went wrong with media upload...');
        else {  
          var id = data.media_id_string;
          var tweet = {
            status: tweets[0],
            media_ids: [id]
          }

          function tweeted(err, data, response) {
            if (err) console.log('Something went wrong with tweet...');
            else console.log('Tweeted!')
          
            tweets.shift();
            if (tweets.length > 0) tweetImages(tweets);
          }
        
          T.post('statuses/update', tweet, tweeted);
        }
      }
    
      T.post('media/upload', media, uploaded);
    });
  });
}

tweet();
setInterval(tweet,1000*60*60*8);

