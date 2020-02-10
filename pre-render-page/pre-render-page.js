const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const { createPicture } = require('../utils/build-utils');
const config = require('../build-config');
const data = require('../data/data.json');

const genIconLink = (href, fileName) => `
  <a href="${href}" class="social-icon" target="_blank" rel="noopener">
    <img src="${path.join(config.icons_path, `${fileName}.svg`)}" alt="${fileName}"></img>
  </a>
`;

const generateProfile = (profileData, subTitle) => {
  const id = profileData.social_links.twitter.id;
  const name = profileData.name;
  const socialLinks = profileData.social_links;
  const $ = cheerio.load('<item></item>')
  const item = $('item');
  item.addClass('profile');
  item.attr('id', 'profile-' + id);
  item.append(`
    ${createPicture(path.join(config.profile_pics_path, id), 
      config.profile_pic_sizes, 'any', `${name}'s profile picture`, '40px', '40px')}
    <div class="line-item">
      <span class="primary-line-item-text">${name}</span>
      ${subTitle ? `<div class="secondary-line-item-text">${subTitle}</div>` : ''}
    </div>
    <div class="social-links">
      ${config.social_link_types.map((linkType) => {
        const socialLink = socialLinks[linkType];
        return !!socialLink ? genIconLink(socialLink.url, socialLink.name) : '';
      }).join('')}
    </div>
  `);
  return item;
};

const $ = cheerio.load('<div class="profile-list"></div>');

for (let i = 0; i < config.num_frames; i++) {
  const profile = generateProfile(data[i]);
  profile.data('idx', i);
  $('.profile-list').append(profile);
}

// Divider
$('.profile-list').append('<hr></hr>');

// Me
$('.profile-list').append(generateProfile({
  name: 'Justbrian',
  social_links: {
    twitter: {
      id: 'ReefBlowPlay',
      url: 'https://twitter.com/ReefBlowPlay',
      name: 'twitter'
    }
  }
}, 'App Developer'));

let template = fs.readFileSync(path.join(config.project_dir, config.src_path, 'template.html'));
template = template.toString().replace('<!--LIST_INJECTION_POINT-->', $('.profile-list').html());
fs.writeFileSync(path.join(config.project_dir, config.src_path, 'index.html'), template);
