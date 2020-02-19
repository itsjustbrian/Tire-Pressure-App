const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const { createPicture } = require('../utils/common-utils');
const { resize, base64Image } = require('../utils/build-utils');
const config = require('../build-config');
const data = require('../data/data.json');
const gm = require('gm');
const del = require('del');
const ncp = require('ncp');

gmAsync = (cmd, outFile) => new Promise((resolve) => cmd.write(outFile, resolve));
ncpAsync = (src, dest) => new Promise((resolve) => ncp(src, dest, resolve));

// const fileHash = (filename, algorithm = 'md5') => {
//   return new Promise((resolve, reject) => {
//     // Algorithm depends on availability of OpenSSL on platform
//     // Another algorithms: 'sha1', 'md5', 'sha256', 'sha512' ...
//     let shasum = crypto.createHash(algorithm);
//     try {
//       let s = fs.ReadStream(filename)
//       s.on('data', function (data) {
//         shasum.update(data)
//       })
//       // making digest
//       s.on('end', function () {
//         const hash = shasum.digest('hex')
//         return resolve(hash);
//       })
//     } catch (error) {
//       return reject('calc fail');
//     }
//   });
// }

try {(async () => {

  const publicAssetsPath = path.join(config.project_dir, '/public/assets');
  await del(publicAssetsPath, {force: true});
  await ncpAsync(path.join(config.project_dir, '/assets'), publicAssetsPath);

  // for (let setName of Object.keys(config.image_sets)) {
  //   const setConfig = config.image_sets[setName];
  //   for (let fileName of fs.readdirSync(path.join(config.project_dir, '/public', setConfig.path))) {
  //     const filePath = path.join(config.project_dir, '/public', setConfig.path, fileName);
  //     fs.renameSync(filePath, filePath.replace('.', `-v${config.version}.`));
  //   }
  // }

  const genIconLink = (href, fileName) => {
    //const svg = fs.readFileSync(path.join(config.project_dir, config.icons_path, `${fileName}.svg`));
    return `
      <a href="${href}" class="social-icon" target="_blank" rel="noopener">
        <img src="${path.join(config.icons_path, `${fileName}.svg`)}" alt="${fileName}"></img>
      </a>
    `;
  };

  const generateProfile = (profileData, subTitle) => {
    const id = profileData.social_links.twitter.id;
    const name = profileData.name;
    const socialLinks = profileData.social_links;
    const profilePicOptions = {
      path: path.join(config.image_sets.profile_pics.path, id),
      srcSizes: config.image_sets.profile_pics.sizes,
      alt: `${name}'s profile picture`,
      lazy: true,
      imgClass: 'profile-pic'
    };
    const $ = cheerio.load('<item></item>')
    const item = $('item');
    item.addClass('profile');
    item.attr('id', id);
    item.attr('data-name', name);
    item.append(`
      <a class="profile-link" href="${socialLinks.twitter.url}" target="_blank" rel="noopener">
        ${createPicture(profilePicOptions)}
        <div class="line-item">
          <div class="primary-line-item-text">${name}</div>
          ${subTitle ? `<div class="secondary-line-item-text">${subTitle}</div>` : ''}
        </div>
      </a>
    `);
    return item;
  };

  let $ = cheerio.load('<div class="profile-list"></div>');

  data.main_frame_artists.forEach((profileData, i) => {
    const profileElement = generateProfile(profileData);
    profileElement.attr('data-idx', i);
    $('.profile-list').append(profileElement);
  });

  $('.profile-list').append('<hr></hr>'); // Divider

  $('.profile-list').append(generateProfile(data.bg_artist, 'Background Artist'));

  data.extra_frame_artists.forEach((profileData) => $('.profile-list').append(generateProfile(profileData, 'Extra Frame Artist')));

  $('.profile-list').append(generateProfile(data.app_dev, 'App Developer'));

  const logoOptions = {
    path: path.join(config.image_sets.logos.path, 'tpplogo'),
    srcSizes: config.image_sets.logos.sizes,
    sizes: '100px',
    alt: 'Tire Pressure Project logo',
    lazy: true,
    imgClass: 'tpplogo',
    baseFormat: 'png'
  };
  $('.profile-list').append(createPicture(logoOptions));
  const profileList = $('.profile-list').html();

  const loadingSpinnerOptions = {
    path: path.join(config.image_sets.logos.path, 'tpp_loading_spinner'),
    srcSizes: config.image_sets.logos.sizes,
    sizes: '100px',
    alt: 'Loading spinner',
    imgClass: 'loading-spinner',
    baseFormat: 'png'
  };
  $ = cheerio.load(createPicture(loadingSpinnerOptions));
  $('picture').attr('hidden', true);
  const loadingSpinner = cheerio.html($('picture'));

  const size = 42;
  const backgroundPath = path.join(config.project_dir, '/assets/background/');
  const backgroundFile = path.join(backgroundPath, `tppbg-${size}.jpg`);
  await resize('tppbg', backgroundPath, 'png', ['jpg'], [size]);
  await gmAsync(gm(backgroundFile).blur(4, 2), backgroundFile);
  // gm(backgroundFile).blur(1, 0).write(path.join(backgroundPath, `tppbg-${size}-blurred.jpg`), () => {});
  const base64Background = base64Image(backgroundFile);
  $ = cheerio.load('<img></img>');
  $('img').attr('id', 'placeholder');
  $('img').attr('src', base64Background);
  const placeholderImg = cheerio.html($('img'));

  let template = fs.readFileSync(path.join(config.project_dir, config.src_path, 'template.html')).toString();
  template = template.replace('<!--LIST_INJECTION_POINT-->', profileList);
  template = template.replace(/<!--LOADING_SPINNER_INJECTION_POINT-->/g, loadingSpinner);
  template = template.replace('<!--PLACEHOLDER_INJECTION_POINT-->', placeholderImg);
  fs.writeFileSync(path.join(config.project_dir, config.src_path, 'index.html'), template);

})()
} catch (error) {
  console.error(error);
}