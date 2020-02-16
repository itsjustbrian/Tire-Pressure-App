const path = require('path');
const config = require('../build-config');
const glob = require('glob');
const csv2json = require('./csv2json.js');
const fs = require('fs');

const TWITTER_COL = 'Twitter';
const INSTAGRAM_COL = 'Instagram';
const DEVELOPER_KEY = 'Artist of Coding';
const BG_ARTIST_KEY = 'BG Artist';
const EXTRA_ARTIST_KEY = 'Extra Contribution';

glob('*.csv', (er, files) => {
  const csvFile = fs.readFileSync(files[0]);
  const data = csv2json(csvFile.toString(), { parseNumbers: true });
  const parsed_data = { main_frame_artists: [], app_dev: null, bg_artist: null, extra_frame_artists: [] };

  for (let artist of data) {
    artist.name = artist['Artist'];
    delete artist['Artist'];
    artist.social_links = {};
    const twitterId = artist[TWITTER_COL].split(' ')[0].slice(1);
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
        url: `https://instagram.com/${artist[INSTAGRAM_COL]}`
      };
    }
    delete artist[INSTAGRAM_COL];

    const key = artist['#'];
    delete artist['#'];
    if (Number.isInteger(key)) {
      artist.number = key;
      parsed_data.main_frame_artists.push(artist);
    }
    if (key === DEVELOPER_KEY) parsed_data.app_dev = artist;
    if (key === BG_ARTIST_KEY) parsed_data.bg_artist = artist;
    if (key === EXTRA_ARTIST_KEY) parsed_data.extra_frame_artists.push(artist);
  }
  
  fs.writeFileSync(path.join(config.project_dir, config.data_path, 'data.json'), JSON.stringify(parsed_data));
});