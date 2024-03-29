const path = require('path');
const fs = require('fs');
const config = require('../build-config');
const { resize } = require('../utils/build-utils');

// for (let file of fs.readdirSync(path.join(config.project_dir, '/assets/artist-frames'))) {
//   const [id, format] = file.split('.');
//   if (parseInt(id.split('-')[1])) {
//     del(path.join(config.project_dir, '/assets/artist-frames', file), {force: true});
//   }
// }

const resizeOperations = [];
let filesProcessed = 0;
let totalFiles = 0;

const processSet = (setName) => {
  const setConfig = config.image_sets[setName];
  for (let file of fs.readdirSync(path.join(config.project_dir, setConfig.path))) {
    const [id, format] = file.split('.');
    if (parseInt(id.split('-')[1])) continue; // Ignore processed files with "-size" postfix
    totalFiles++;
    resizeOperations.push((async () => {
      try {
        await resize(id, path.join(config.project_dir, setConfig.path), format, setConfig.outputFormats, setConfig.sizes, setConfig.options);
        filesProcessed++;
      } catch (error) {
        filesProcessed++;
        console.error(`Error processing image for id: ${id} in image set: ${setName}`, error.message);
      }
    })());
  }
};

const args = process.argv;
const setName = args[2];

if (setName) {
  processSet(setName);
} else {
  for (let setName of Object.keys(config.image_sets)) {
    processSet(setName);
  }
}

const intervalId = setInterval(() => {
  console.log(`Progress: ${Math.round(filesProcessed / totalFiles * 100)}%`);
}, 1000);

Promise.all(resizeOperations).then(() => {
  console.log('Resizing complete!');
  clearInterval(intervalId);
});