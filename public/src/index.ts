import "../styles/index.css";
import data from "./data";
import { $ } from "./helpers";

const artistFrames: any = data.artist_frames;
const socialLinkTypes = data.social_link_types;
let currentImageIdx: number = 0;
let playingVideo = false;
let seeking = false;
let seekingDuringPlayback = false;
let muted = true;

const createListItem = (username: string) => {
  const listItem = document.createElement('item');
  listItem.id = 'profile-' + username;
  listItem.classList.add('profile');
  return listItem;
};

const generateProfile = (profileData: any, idx: number) => {
  const listItem = createListItem(profileData.username);
  listItem.dataset.idx = '' + idx;
  const profilePicSrc = (profileData.profile_pic && profileData.profile_pic.length) ? profileData.profile_pic :
    `https://avatars.io/twitter/${profileData.social_links.twitter}/medium`;
  listItem.innerHTML = `
    <img class="profile-pic" src="${profilePicSrc}"></img>
    <div class="line-item">
      <span class="primary-line-item-text">${profileData.username}<span>
      ${profileData.background ? '<div class="secondary-line-item-text">Background artist</div>' : ''}
    </div>
    <div class="social-links">
      ${socialLinkTypes.map((type) => {
    const id = profileData.social_links[type.name];
    if (id && id.length)
      return `<a href="${type.link(id)}" target="_blank" class="social-icon">
                    <img src="assets/icons/${type.name}.png">
                  </a>`;
  }).join('')}
    </div>
  `;
  return listItem;
};

const profileList = $('profile-list') as HTMLUListElement;
artistFrames.forEach((frame: Object, idx: number) => {
  profileList.append(generateProfile(frame, idx), $('tpplogo'));
});

// Me
const me = createListItem('justbrian');
me.innerHTML = `
  <img class="profile-pic" src="https://avatars.io/twitter/ReefBlowPlay/medium"></img>
  <div class="line-item">
    <span class="primary-line-item-text">justbrian<span>
    <div class="secondary-line-item-text">App developer</div>
  </div>
  <div class="social-links">
    <a href="https://twitter.com/ReefBlowPlay" target="_blank" class="social-icon">
      <img src="assets/icons/twitter.png">
    </a>
  </div>
`;
profileList.append(me, $('tpplogo'));

// Load artistFrames
let videoFrames: Array<any> = [];
for (let i = 0; i < 62; i++) {
  videoFrames[i] = { image: new Image(), artistIdx: null };
  videoFrames[i].image.src = `/assets/video_frames/frame${(i + 1).toString().padStart(4, '0')}.png`;
  videoFrames[i].image.id = 'vide';
}

// Map image frames to artist frames and vice versa
let imageIdx = 0;
for (let i = 0; i < artistFrames.length; i++) {
  artistFrames[i].imageIdx = imageIdx;
  for (let j = 0; j < artistFrames[i].num_video_frames; j++) {
    videoFrames[imageIdx].artistIdx = i;
    imageIdx++;
  }
}

const imageIdxToArtistIdx = (imageIdx: number) => videoFrames[imageIdx].artistIdx;
const artistIdxToImageIdx = (artistIdx: number) => artistFrames[artistIdx].imageIdx;



// for (let i = 31; i < 54; i++) {
//   //artistFrames[i].time_displayed = i * (2.483 / 53);
//   //artistFrames[i].username += i;
// }

// console.log(JSON.stringify(artistFrames));

// const offscreen = (document.getElementById('video') as HTMLCanvasElement).transferControlToOffscreen();
// const worker = new Worker('static/video-worker.js');
// worker.postMessage({ canvas: offscreen }, [offscreen]);

let video = $('video') as HTMLImageElement;
const audio = $('audio') as HTMLAudioElement;
const volumeControl = $('volume-control') as HTMLButtonElement;
const frameForwardButton = $('frame-forward') as HTMLButtonElement;
const frameBackwardButton = $('frame-backward') as HTMLButtonElement;
const playPauseButton = $('pause-play-control') as HTMLButtonElement;
const seekBar = $('seek-bar') as HTMLInputElement;
const closeImageViewerButton = $('close-image-viewer') as HTMLButtonElement;
const frameCount = $('frame-count');

const renderFrame = (imageIdx: number, source?: String) => {
  const artistIdx = imageIdxToArtistIdx(imageIdx);
  const currentArtistData = artistFrames[imageIdxToArtistIdx(currentImageIdx)];
  const newArtistData = artistFrames[artistIdx];
  currentImageIdx = imageIdx;

  requestAnimationFrame(async () => {

    // Hide the about page if it's active
    if (!$('about-page').hidden) await showAboutPage(false);

    // Change frame
    video.src = videoFrames[imageIdx].image.src;
    //video.replaceWith(videoFrames[imageIdx].image); video = videoFrames[imageIdx].image;

    // Seek audio
    if (!playingVideo || source === 'seek') audio.currentTime = (1 / 24) * imageIdx;

    // Change selected profile
    $('profile-' + currentArtistData.username).classList.remove('selected');
    const selectedProfile = $('profile-' + newArtistData.username);
    selectedProfile.classList.add('selected');
    selectedProfile.scrollIntoView({ behavior: playingVideo || seekingDuringPlayback || source === 'seek' ? 'auto' : 'smooth' });


    // Enable/disable buttons
    let frameForwardButtonDisabled = artistIdx === artistFrames.length - 1;
    let frameBackwardButtonDisabled = artistIdx === 0;
    if (playingVideo || seekingDuringPlayback) frameForwardButtonDisabled = frameBackwardButtonDisabled = true;
    frameForwardButton.disabled = frameForwardButtonDisabled;
    frameBackwardButton.disabled = frameBackwardButtonDisabled;

    // Change seekbar
    if (!seeking && source !== 'seek') seekBar.value = `${imageIdx}`;

    // Change play/pause button
    if (playingVideo) playPauseButton.classList.remove('paused');
    else playPauseButton.classList.add('paused');

    // Change volume control
    audio.muted = muted;
    muted ? volumeControl.classList.add('muted') : volumeControl.classList.remove('muted');

    // Set frame number
    frameCount.innerText = `${(artistIdx + 1).toString().padStart(2, '0')}/${artistFrames.length}`;
  });
};

const showAboutPage = (show = true) => {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      const currentArtistData = artistFrames[imageIdxToArtistIdx(currentImageIdx)];
      $('profile-' + currentArtistData.username).classList.remove('selected');
      show ? $('profile-justbrian').classList.add('selected') : $('profile-justbrian').classList.remove('selected')
      show ? $('main-content').classList.add('about-page-active') : $('main-content').classList.remove('about-page-active');
      $('about-page').hidden = !show;
      $('video-area').hidden = show;
      requestAnimationFrame(resolve);
    });
  });
};

profileList.addEventListener('click', (event) => {
  let targetNode: HTMLElement | null = event.target as HTMLElement;
  while (true) {
    if (!targetNode || targetNode.nodeName === 'A') return; // Ignore if social link clicked
    if (targetNode.nodeName === 'ITEM') break;
    targetNode = targetNode.parentElement;
  }
  if (targetNode.id === 'profile-justbrian') showAboutPage();
  else if (targetNode.dataset.idx) renderFrame(artistIdxToImageIdx(parseInt(targetNode.dataset.idx)));
});

volumeControl.addEventListener('click', (event) => {
  muted = !muted;
  renderFrame(currentImageIdx);
});

frameForwardButton.addEventListener('click', (event) => {
  const artistIdx = imageIdxToArtistIdx(currentImageIdx);
  if (artistIdx < artistFrames.length - 1) renderFrame(artistIdxToImageIdx(artistIdx + 1));
});

frameBackwardButton.addEventListener('click', (event) => {
  const artistIdx = imageIdxToArtistIdx(currentImageIdx);
  if (artistIdx > 0) renderFrame(artistIdxToImageIdx(artistIdx - 1));
});

playPauseButton.addEventListener('click', async (event) => {
  if (currentImageIdx === videoFrames.length - 1) {
    await renderFrame(0);
    playVideo();
  } else {
    playingVideo ? pauseVideo() : playVideo();
  }
});

seekBar.addEventListener('input', async (event) => {
  const imageIdx = Math.round(parseFloat((<HTMLInputElement>event.currentTarget).value));
  // convert and then convert back to get starting image frame for artist
  if (currentImageIdx !== imageIdx) renderFrame(artistIdxToImageIdx(imageIdxToArtistIdx(imageIdx)), 'seek');
});

seekBar.addEventListener('mousedown', (event) => {
  seeking = true;
  seekBar.focus();
  if (playingVideo) {
    pauseVideo(false);
    seekingDuringPlayback = true;
  }
}, { passive: true });

seekBar.addEventListener('mouseup', (event) => {
  seeking = false;
  if (seekingDuringPlayback) {
    playVideo();
    seekingDuringPlayback = false;
  }
}, { passive: true });

let intervalId: any;
const playVideo = () => {
  if (playingVideo) return;
  playingVideo = true;
  audio.play();
  intervalId = setInterval(() => {
    if (currentImageIdx < videoFrames.length - 1) {
      renderFrame(currentImageIdx + 1);
    }
    else pauseVideo();
  }, (1 / 24) * 1000);
};
const pauseVideo = (shouldRender = true) => {
  if (playingVideo) {
    clearInterval(intervalId);
    audio.pause();
    playingVideo = false;
    if (shouldRender) renderFrame(currentImageIdx);
  }
}

closeImageViewerButton.addEventListener('click', (event) => {
  $('image-viewer').hidden = true;
});

video.addEventListener('click', (event) => {
  const fileName = artistFrames[imageIdxToArtistIdx(currentImageIdx)].frame_image;
  const artistFrameImage = $('artist-frame') as HTMLImageElement;
  if (fileName && fileName.length && fileName !== artistFrameImage.dataset.fileName) {
    artistFrameImage.hidden = true;
    $('image-loading').hidden = false;
    artistFrameImage.onload = (event) => {
      $('image-loading').hidden = true;
      artistFrameImage.hidden = false;
    };
    artistFrameImage.dataset.fileName = fileName;
    artistFrameImage.src = `assets/artist_frames/${fileName}`;
  }
  $('image-viewer').hidden = false;
  $('close-image-viewer').focus();
});

const scrollToCurrentProfile = () => {
  const currentArtistData = artistFrames[imageIdxToArtistIdx(currentImageIdx)];
  const selectedProfile = $('profile-' + currentArtistData.username);
  selectedProfile.scrollIntoView({ behavior: 'auto' });
};

const onMediaQuery = async (event: MediaQueryListEvent | MediaQueryList) => {
  $(event.matches ? 'profile-list' : 'main-content').append($('video-controls'));
};

const smallScreen = window.matchMedia("(max-width: 720px)");
onMediaQuery(smallScreen);
smallScreen.addEventListener('change', onMediaQuery);

const ro = new ResizeObserver((entries: any) => {
  for (let entry of entries) {
    if (entry.contentRect.height > 0) {
      document.body.style.cssText = `scroll-padding-top: ${entry.contentRect.height}px`;
      scrollToCurrentProfile();
    } else if (document.scrollingElement) {
      document.scrollingElement.scrollTop = document.scrollingElement.scrollHeight;
    }
  }
});
ro.observe($('video-area'));


renderFrame(currentImageIdx);
