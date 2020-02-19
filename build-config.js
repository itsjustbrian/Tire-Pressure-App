
module.exports = {
  project_dir: __dirname,
  src_path: '/src/',
  icons_path: '/assets/icons/',
  artist_frames_path: '/assets/artist-frames/',
  background_path: '/assets/background/full/',
  data_path: '/data/',
  social_link_types: ['newgrounds', 'instagram', 'youtube', 'twitter'],
  num_frames: 60,

  image_sets: {
    profile_pics: {
      path: '/assets/profile-pics/',
      sizes: [40, 80, 120],
      outputFormats: ['jpg', 'webp'],
    },
    video_frames: {
      path: '/assets/video-frames/',
      sizes: [500, 900, 1300, 1700, 2100],
      outputFormats: ['jpg', 'webp'],
    },
    logos: {
      path: '/assets/tpplogo/',
      sizes: [100, 200, 300, 400],
      outputFormats: ['png', 'webp'],
    },
    background: {
      path: '/assets/background/full/',
      sizes: [4446],
      outputFormats: ['jpg'],
    },
  },
};
