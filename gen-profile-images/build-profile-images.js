const path = require('path');
const config = require('../build-config');
const data = require('../data/data.json');
const { resize } = require('../utils/build-utils');

Promise.all(data.map((artist) =>
  resize(artist.social_links.twitter.id,
    path.join(config.project_dir, config.profile_pics_path), config.profile_pic_sizes))).then(() => {
      console.log('Processing complete');
    });