const sharp = require('sharp');

const inputFileFormat = (id, path) => `${path}/${id}.png`;
const outputFileFormat = (id, path, width, format) => `${path}/${id}-${width}.${format}`;

const resizeToJpeg = (id, width, path) => sharp(inputFileFormat(id, path))
  .resize(width, null)
  .jpeg({ progressive: true })
  .toFile(outputFileFormat(id, path, width, 'jpg'));

const resizeToWebp = (id, width, path) => sharp(inputFileFormat(id, path))
  .resize(width, null)
  .webp()
  .toFile(outputFileFormat(id, path, width, 'webp'));

const resize = (id, path, widths) => {
  return Promise.all(widths.map((width) =>
    Promise.all([
      resizeToJpeg(id, width, path),
      resizeToWebp(id, width, path)
    ])
    .catch((error) => {
      console.error('Error resizing image for id: ' + id, error.message);
    })));
};

const createPicture = (path, srcSizes, sizes, alt, width, height) => {
  const createSrcFile = (path, size, format) => `${path}-${size}.${format}`;
  const createSrcSet = (format) => srcSizes.map((size) => `${createSrcFile(path, size, format)} ${size}w,`).join(' ');
  return `
    <picture class="profile-pic">
      <source type="image/webp" data-srcset="${createSrcSet('webp')}" data-sizes="${sizes}"/>
      <source type="image/jpeg" data-srcset="${createSrcSet('jpg')}" data-sizes="${sizes}"/>
      <img class="profile-pic lazyload" data-src="${createSrcFile(path, Math.max(...srcSizes), 'jpg')}" alt="${alt}" width="${width}" height="${height}"/>
    </picture>
  `;
};

module.exports = {
  resize,
  createPicture
};