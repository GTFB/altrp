import sharp from 'sharp';

export async function optimizeImage(
  buffer: Buffer,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  } = {}
) {
  const {
    width,
    height,
    quality = 80,
    format = 'webp',
  } = options;

  let pipeline = sharp(buffer);

  if (width || height) {
    pipeline = pipeline.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  switch (format) {
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality });
      break;
    case 'png':
      pipeline = pipeline.png({ quality });
      break;
    case 'webp':
    default:
      pipeline = pipeline.webp({ quality });
      break;
  }

  return pipeline.toBuffer();
}

export async function generateThumbnail(
  buffer: Buffer,
  size: number = 300
) {
  return optimizeImage(buffer, {
    width: size,
    height: size,
    quality: 70,
    format: 'webp',
  });
}
