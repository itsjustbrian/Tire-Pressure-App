const path = require('path');
const config = require('../build-config');
const glob = require('glob');
const FfmpegCommand = require('fluent-ffmpeg');

glob('./*.mp4', (er, files) => {
  const fileName = files[0];
  new FfmpegCommand()
    .input(fileName)
    .output(path.join(config.project_dir, config.video_frames_path, '%d.png'))
    .on('start', (commandLine) => {
      console.log('Spawned Ffmpeg with command: ' + commandLine);
    })
    .on('error', (err) => {
      console.log('An error occurred: ' + err.message);
    })
    .on('end', () => {
      console.log('Processing finished!');
    })
    .run();
});