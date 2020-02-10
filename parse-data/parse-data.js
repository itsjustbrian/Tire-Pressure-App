const path = require('path');
const config = require('../build-config');
const glob = require('glob');
const csv2json = require('./csv2json.js');
const fs = require('fs');

const TWITTER_COL = 'Twitter';
const INSTAGRAM_COL = 'Instagram';

glob('*.csv', (er, files) => {
  const csvFile = fs.readFileSync(files[0]);
  let data = csv2json(csvFile.toString(), { parseNumbers: true });
  data = data.slice(0, config.num_frames);
  for (let artist of data) {
    delete artist['#'];
    artist.name = artist['Artist'];
    delete artist['Artist'];
    artist.social_links = {};
    const twitterId = artist[TWITTER_COL].slice(1);
    artist.social_links.twitter = {
      name: 'twitter',
      id: twitterId,
      url: `https://twitter.com/${twitterId}`
    };
    delete artist[TWITTER_COL];
    if (artist[INSTAGRAM_COL].length) {
      artist.social_links.instagram = {
        name: 'instagram',
        id: artist[INSTAGRAM_COL],
        url: `https://instragram.com/${artist[INSTAGRAM_COL]}`
      };
    }
    delete artist[INSTAGRAM_COL];
  }
  fs.writeFileSync(path.join(config.data_path, 'data.json'), JSON.stringify(data));
});