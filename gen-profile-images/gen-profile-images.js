const path = require('path');
const config = require('../build-config');
const data = require('../data/data.json');
const fs = require('fs');
const r = require('request');
const rp = require('request-promise');
const cheerio = require('cheerio');
const del = require('del');
const { dataIterator } = require('../utils/build-utils');

const getSiteData = (uri) => rp({ uri, transform: (body) => cheerio.load(body) });

const getInstagramProfileImageLink = async (instagramId) => {
  const $ = await getSiteData(`https://instagram.com/${instagramId}`); // Scrape instagram as backup
  const raw = $.html();
  // url is in a json object with key profile_pic_url_hd
  const key = 'profile_pic_url_hd';
  const profilePicUrlStartIndex = raw.indexOf(key) + key.length + 3;
  const picLink = decodeURIComponent(JSON.parse(`"${raw.slice(profilePicUrlStartIndex, raw.indexOf('"', profilePicUrlStartIndex))}"`));
  return picLink;
};

const getTwitterProfileImageLink = async (twitterId) => {
  const $ = await getSiteData(`https://twitter.com/${twitterId}`); // Scrape twitter profile
  return $('img.ProfileAvatar-image')[0].attribs.src;
};

const downloadFile = ((uri, dir) => {
  return new Promise((resolve, reject) => {
    r(uri).on('response', (response) => {
      if (response.statusCode !== 200) reject(response);
    }).pipe(fs.createWriteStream(dir)).on('finish', resolve).on('error', (error) => reject(error));
  }).catch(() => del(dir)); // Clean up blank file
});

const main = () => {
  let downloadCount = 0;
  for (let artist of dataIterator(data)) {
    const twitterId = artist.social_links.twitter.id;
    getTwitterProfileImageLink(twitterId).then((link) => {
      return link;
    }).catch((error) => {
      console.error('Error getting image link for ' + twitterId + ' using Twitter');
      return getInstagramProfileImageLink(artist.social_links.instagram.id);
    }).then((link) => {
      downloadCount++;
      console.log('Downloaded', downloadCount, 'images');
      return downloadFile(link, path.join(config.project_dir, config.image_sets.profile_pics.path, `${artist.social_links.twitter.id}.png`));
    }).catch((error) => {
      console.error('Error getting image link for ' + twitterId + ' using Instagram');
    });
  }
};

main();