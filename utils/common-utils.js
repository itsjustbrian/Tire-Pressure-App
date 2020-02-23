const createPicture = (options) => {
  const { path, srcSizes, sizes, width, height, alt, baseFormat, lazy, imgClass } = options;
  const createSrcFile = (path, size, format) => `${path}-${size}.${format}`;
  const createSrcSet = (format) => srcSizes.map((size) => `${createSrcFile(path, size, format)} ${size}w`).join(', ');
  const largestSize = Math.max(...srcSizes);
  return `
    <picture${imgClass ? ` class="${imgClass}"` : ''}>
      <source type="image/webp" ${lazy ? 'data-' : ''}srcset="${createSrcSet('webp')}" sizes="${sizes || 'any'}"/>
      <source type="image/${baseFormat ? baseFormat === 'jpg' ? 'jpeg' : 'png' : 'jpeg'}" ${lazy ? 'data-' : ''}srcset="${createSrcSet(baseFormat || 'jpg')}" sizes="${sizes || 'any'}"/>
      <img ${imgClass || lazy ? `class="${imgClass ? imgClass + ' ' : ''}${lazy ? 'lazyload' : ''}"` : ''} 
        ${lazy ? 'data-' : ''}src="${createSrcFile(path, largestSize, baseFormat || 'jpg')}" 
        alt="${alt}" width="${width}" height="${height}"/>
    </picture>
  `;
};

module.exports = {
  createPicture
};