const sharp = require('sharp');
const fs = require('fs');

const defaultOptionsMap = {
  'jpg': {
    function: 'jpeg',
    options: {
      progressive: true
    }
  },
  'png': {
    function: 'png',
  },
  'webp': {
    function: 'webp',
  }
}

const resizeFile = (id, path, inputFormat, outputFormat, width, userOptions) => {
  const defaultOptions = defaultOptionsMap[outputFormat].options;
  let options = {};
  if (defaultOptions && userOptions && userOptions[outputFormat]) {
    options = Object.assign(defaultOptions, userOptions[outputFormat]);
  }
  return sharp(`${path}${id}.${inputFormat}`)
    .resize(width, null)
    [defaultOptionsMap[outputFormat].function](options)
    .toFile(`${path}${id}-${width}.${outputFormat}`);
};

const resize = (id, path, inputFormat, outputFormats, widths, options) => {
  return Promise.all(widths.map((width) =>
    Promise.all(outputFormats.map((outputFormat) =>
      resizeFile(id, path, inputFormat, outputFormat, width, options)))));
};

const base64Prefix = 'data:image/jpeg;base64,';

const base64Image = (path) => {
  return base64Prefix + fs.readFileSync(path, 'base64');
};

const dataIterator = (data) => {
  return {
    *[Symbol.iterator]() {
      for (let main_artist of data.main_frame_artists) {
        yield main_artist;
      }
      yield data.app_dev;
      yield data.bg_artist;
      for (let extra_artist of data.extra_frame_artists) {
        yield extra_artist;
      }
    }
  }
};

module.exports = {
  resize,
  dataIterator,
  base64Image
};