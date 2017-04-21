//Author: Fern Pombeiro
//Last updated: 21 April 2017
//Purpose: create a program with an "full body" image of a model
//Create a second image that crops just the face

//npm install -g faced
var Faced = require('faced');
var fs = require('fs');
var gm = require('gm');
var glob = require('glob');
var path = require('path');
var faced = new Faced();



//First let's find the file. Some files are "png", some are "jpeg" and some might
//be ".jpg"- so we're going to glob for it:

var picture = glob.sync(process.cwd() + '/model.*');
if (picture.length > 1) {
    console.log("There appear to be multiple 'model' files in this directory. I will choose one" +
                "at random but you really should delete one of them")
};
//Now we're going to use our Faced object to find the x/y axes to locate the face

faced.detect(picture[0], function (faces, image, file) {
  //Error check
  if (typeof faces == 'undefined' || faces.length < 1) {
    return console.error("Epic fail on finding faces in ", picture[0]);
              }
    //Now import the image into magick
    var orig_img = gm(picture[0]);
    //crop the image based on the width, height, x and y axes
    var tsmarker = Math.round(+new Date()/1000)
    console.log('got faces! ', faces)
  if (typeof faces == 'undefined') {
    console.error("error with finding faces");
  }
    var cropped_img = orig_img.crop(faces[0].getWidth(),
                                faces[0].getHeight(),
                                faces[0].getX(),
                                //resize the image to close to thumbnail
                                faces[0].getY()).resize(300, 300);
    var write_out_file = process.cwd() + '/faces/model_face_processed_' + tsmarker.toString() + '.png'
    cropped_img.write(write_out_file, function (err) {
      if (!err) console.log('done');
      else console.log("Error writing to file ", err); 
      fs.createReadStream(picture[0]).pipe(fs.createWriteStream(process.cwd() + '/bodies/' + path.parse(picture[0]).name +
              '_processed_' + tsmarker.toString() + '_' + path.extname(picture[0])))
              });
    console.log("Successfully found faces and moved files to /bodies/ and /faces/ subdirectories!");
});




