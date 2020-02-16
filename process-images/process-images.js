const path = require('path');
const fs = require('fs');
const config = require('../build-config');
const { resize } = require('../utils/build-utils');
const del = require('del');

// for (let file of fs.readdirSync(path.join(config.project_dir, '/assets/artist-frames'))) {
//   const [id, format] = file.split('.');
//   if (parseInt(id.split('-')[1])) {
//     del(path.join(config.project_dir, '/assets/artist-frames', file), {force: true});
//   }
// }

const resizeOperations = [];
let filesProcessed = 0;
let totalFiles = 0;
for (let setName of Object.keys(config.image_sets)) {
  const setConfig = config.image_sets[setName];
  for (let file of fs.readdirSync(path.join(config.project_dir, setConfig.path))) {
    const [id, format] = file.split('.');
    if (parseInt(id.split('-')[1])) continue; // Ignore processed files with "-size" postfix
    totalFiles++;
    resizeOperations.push(
      resize(id, path.join(config.project_dir, setConfig.path), format, setConfig.outputFormats, setConfig.sizes, setConfig.options)
        .then(() => {
          filesProcessed++;
        })
        .catch((error) => {
          filesProcessed++;
          console.error(`Error resizing image for id: ${id} in image set: ${setName}`, error.message);
        })
    );
  }
}

const intervalId = setInterval(() => {
  console.log(`Progress: ${Math.round(filesProcessed / totalFiles * 100)}%`);
}, 1000);

Promise.all(resizeOperations).then(() => {
  console.log('Resizing complete!');
  clearInterval(intervalId);
});