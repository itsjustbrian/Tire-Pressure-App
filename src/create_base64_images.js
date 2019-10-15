"use strict";
exports.__esModule = true;
var data_1 = require("./data");
var fs = require("fs");
var path = require("path");
var data = data_1["default"];
var imagesPath = path.join(__dirname, '../small_images');
var dataJSONPath = path.join(__dirname, 'data.json');
var base64Prefix = function (fileType) { return "data:image/" + fileType + ";base64,"; };
fs.readdir(imagesPath, function (err, files) {
    if (err)
        console.log(err);
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var fileName = files_1[_i];
        var fileType = fileName.endsWith('jpg') ? 'jpeg' : undefined;
        if (fileType) {
            var fileNumber = parseInt(fileName.slice('frame'.length, fileName.indexOf('.')));
            var imgBase64 = base64Prefix(fileType) + fs.readFileSync(imagesPath + "/" + fileName, 'base64');
            data.artist_frames[fileNumber - 1].img_placeholder = imgBase64;
        }
    }
    fs.writeFileSync(dataJSONPath, JSON.stringify(data), 'utf8');
});
// for (let artist of data.artist_frames) {
//   const imageAsBase64 = fs.readFileSync('./your-image.png', 'base64');
// }
