void setup() {
 
  PImage bg = loadImage("sign.jpg");
  size(275, 275);
  background(bg);

  String[] tweets = loadStrings("../toTweet.txt");
  String tweet = tweets[0];
  tweets = match(tweet, "(\\d+)(\\s)(days)");
  tweet = tweets[0].replace(" days", "");
   
  textSize(30);
  textAlign(RIGHT);
  fill(0);
  text(tweet, 0.5*width, 0.61*height);
  save("output.png");
  exit();
} 
