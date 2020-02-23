const path = require('path');
const config = require('../build-config');
const glob = require('glob');
const csv2json = require('./csv2json.js');
const fs = require('fs');

const ID_COL = '#';
const ARTIST_COL = 'Artist';
const TWITTER_COL = 'Twitter(ID)';
const INSTAGRAM_COL = 'Instagram(ID)';
const YOUTUBE_COL = 'Youtube(Link)';
const NEWGROUNDS_COL = 'Newgrounds(Link)';
const PREFERRED_COL = 'Preferred social media';
const DEVELOPER_KEY = 'Artist of Coding';
const BG_ARTIST_KEY = 'BG Artist';
const EXTRA_ARTIST_KEY = 'Extra Contribution';

glob('*.csv', (er, files) => {
  const csvFile = fs.readFileSync(files[0]);
  const data = csv2json(csvFile.toString(), { parseNumbers: true });
  const parsed_data = { main_frame_artists: [], app_dev: null, bg_artist: null, extra_frame_artists: [] };

  for (let artist of data) {
    artist.name = artist[ARTIST_COL];
    delete artist[ARTIST_COL];
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

    if (artist[YOUTUBE_COL].length) {
      artist.social_links.youtube = {
        name: 'youtube',
        url: artist[YOUTUBE_COL]
      };
    }
    delete artist[YOUTUBE_COL];

    if (artist[NEWGROUNDS_COL].length) {
      artist.social_links.newgrounds = {
        name: 'newgrounds',
        url: artist[NEWGROUNDS_COL]
      };
    }
    delete artist[NEWGROUNDS_COL];

    artist.preferred_link = artist[PREFERRED_COL].length ? artist[PREFERRED_COL].toLowerCase() : 'twitter';
    delete artist[PREFERRED_COL];

    const key = artist[ID_COL];
    delete artist[ID_COL];
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