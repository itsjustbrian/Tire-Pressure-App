const path = require('path');
const config = require('../build-config.json');
const { resize } = require('../utils/build-utils');

const resizePromises = [];
for (let i = 1; i < config.num_frames + 1; i++) {
  resizePromises.push(resize(i, path.join(config.project_dir, config.video_frames_path), config.video_frame_sizes));
}

Promise.all(resizePromises).then(() => {
  console.log('Processing complete');
});