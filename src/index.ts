const config = require("../build-config");
const { createPicture } = require("../utils/common-utils");

import "./index.css";
import lazySizes from "lazysizes";
import { $, aFrame, htmlToTemplate } from "./helpers";

lazySizes.cfg.loadMode = 1;
lazySizes.cfg.expand = 300;

const listItemHeight = 56;
const responsiveWidth = 800
const smallScreen = window.matchMedia(`(max-width: ${responsiveWidth}px)`);

const developerId = 'ReefBlowPlay';
const videoFrames: Array<HTMLPictureElement> = [];
//const frameStageQueue: Array<HTMLElement> = [];
let currentFrameIdx: number = 0;
let playingVideo = false;
let seeking = false;
let seekingDuringPlayback = false;
let muted = true;
let repeatActive = false;

// Delay loading of inactive frames
// window.addEventListener('fonts-loaded', () => {
//   for (let frameElement of frameStageQueue) {
//     $('frame-stage').append(frameElement);
//   }
// });

document.addEventListener('DOMContentLoaded', async () => {

  const firebaseConfig = {
    apiKey: "AIzaSyBUFQbnpxvzWLsnmwJ3V_9l-3QRNfu_Y9I",
    authDomain: "tire-pressure-project.firebaseapp.com",
    databaseURL: "https://tire-pressure-project.firebaseio.com",
    projectId: "tire-pressure-project",
    storageBucket: "tire-pressure-project.appspot.com",
    messagingSenderId: "594805679759",
    appId: "1:594805679759:web:d003cce18f56b08fd372fa",
    measurementId: "G-DRK34XYMLJ"
  };

  firebase.initializeApp(firebaseConfig);
  const analytics = firebase.analytics();

  let video = null as HTMLPictureElement | null;
  const audio = $('audio') as HTMLAudioElement;
  const volumeControl = $('volume-control') as HTMLButtonElement;
  const frameForwardButton = $('frame-forward') as HTMLButtonElement;
  const frameBackwardButton = $('frame-backward') as HTMLButtonElement;
  const repeatButton = $('repeat') as HTMLButtonElement;
  const playPauseButton = $('pause-play-control') as HTMLButtonElement;
  const seekBar = $('seek-bar') as HTMLInputElement;
  const closeModalButton = $('close-modal') as HTMLButtonElement;
  const profileList = $('profile-list') as HTMLElement;
  const videoFramePlaceholder = $('placeholder') as HTMLElement;
  const videoFrameLoadingSpinner = document.querySelector('#video-area .loading-spinner') as HTMLElement;
  videoFrameLoadingSpinner.hidden = false;
  const frameCount = $('frame-count');

  const getProfileFromIndex = (idx) => {
    const profileElement = document.querySelector(`item[data-idx="${idx}"]`) as HTMLElement;
    return {
      id: profileElement.id,
      name: profileElement.dataset.name,
      element: profileElement
    }
  }

  for (let i = 0; i < config.num_frames; i++) {
    const profile = getProfileFromIndex(i);
    const framePictureOptions = {
      path: config.image_sets.video_frames.path + (i + 1),
      srcSizes: config.image_sets.video_frames.sizes,
      alt: `${profile.name}'s frame`
    };
    const videoFrameTemplate = htmlToTemplate(createPicture(framePictureOptions));
    const imgElement = videoFrameTemplate.querySelector('img') as HTMLElement;
    const videoFrameElement = videoFrameTemplate.firstChild as HTMLElement;
    imgElement.style.cssText = 'opacity: 0;';
    imgElement.id = 'video';
    imgElement.onload = () => {
      imgElement.style.cssText = 'opacity: 1; transition: opacity 0.5s ease 0s;';
      videoFrameElement.dataset.loaded = 'true';
      if (i === currentFrameIdx) {
        videoFrameLoadingSpinner.hidden = true;
      }
    };
  
    $('frame-stage').append(videoFrameElement);
    videoFrames.push(videoFrameElement);
  }

  const renderFrame = async (frameIdx: number, source?: String) => {
    const currentProfile = getProfileFromIndex(currentFrameIdx);
    const newProfile = getProfileFromIndex(frameIdx);
    currentFrameIdx = frameIdx;

    return animationFramePromise(async () => {

      // Change frame
      // video.src = videoFrames[imageIdx].image.src;
      // if (video.hidden) video.hidden = false;
      if (video) {
        video.removeEventListener('click', onVideoClicked);
        video.replaceWith(videoFrames[frameIdx]);
        videoFrameLoadingSpinner.hidden = !!videoFrames[frameIdx].dataset.loaded;
      } else {
        $('video-area').append(videoFrames[frameIdx]);
      }
      video = videoFrames[frameIdx];
      video.addEventListener('click', onVideoClicked);

      // Hide the about page if it's active
      if (!$('about-page').hidden) await showAboutPage(false);

      // Seek audio
      if (!playingVideo || source === 'seek' || source === 'repeat') audio.currentTime = (1 / 24) * frameIdx;

      // Change selected profile
      currentProfile.element.classList.remove('selected');
      newProfile.element.classList.add('selected');

      // Auto scroll to selected profile
      scrollToProfile(frameIdx, playingVideo || seekingDuringPlayback || source === 'seek' ? 'auto' : 'smooth');

      // Enable/disable buttons
      let frameForwardButtonDisabled = frameIdx === config.num_frames - 1;
      let frameBackwardButtonDisabled = frameIdx === 0;
      if (playingVideo || seekingDuringPlayback) frameForwardButtonDisabled = frameBackwardButtonDisabled = true;
      frameForwardButton.disabled = frameForwardButtonDisabled;
      frameBackwardButton.disabled = frameBackwardButtonDisabled;

      // Change seekbar
      if (!seeking && source !== 'seek') seekBar.value = `${frameIdx}`;

      // Change play/pause button
      if (playingVideo) playPauseButton.classList.remove('paused');
      else playPauseButton.classList.add('paused');

      // Set frame number
      //frameCount.innerText = `${(artistIdx + 1).toString().padStart(2, '0')}/${artistFrames.length}`;
    });
  };

  const showAboutPage = (show = true) => {
    return animationFramePromise(() => {
      const currentProfile = getProfileFromIndex(currentFrameIdx);
      currentProfile.element.classList.remove('selected');
      $(developerId).classList[show ? 'add' : 'remove']('selected');
      $('main-content').classList[show ? 'add' : 'remove']('about-page-active');
      $('about-page').hidden = !show;
      $('video-area').hidden = show;
    });
  };

  const animationFramePromise = (callback) => {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        callback();
        requestAnimationFrame(resolve);
      });
    });
  };

  profileList.addEventListener('click', (event) => {
    let targetNode: HTMLElement | null = event.target as HTMLElement;
    while (true) {
      if (!targetNode || targetNode.nodeName === 'A') return; // Ignore if social link clicked
      if (targetNode.nodeName === 'ITEM') break;
      targetNode = targetNode.parentElement;
    }
    if (targetNode.id === developerId) showAboutPage();
    else if (targetNode.dataset.idx) renderFrame((parseInt(targetNode.dataset.idx)));
  });

  volumeControl.addEventListener('click', (event) => {
    muted = !muted;
    audio.muted = muted;
    volumeControl.classList[muted ? 'add' : 'remove']('muted');
  });

  frameForwardButton.addEventListener('click', (event) => {
    if (currentFrameIdx < config.num_frames - 1) renderFrame(currentFrameIdx + 1);
  });

  frameBackwardButton.addEventListener('click', (event) => {
    if (currentFrameIdx > 0) renderFrame(currentFrameIdx - 1);
  });

  playPauseButton.addEventListener('click', async (event) => {
    if (currentFrameIdx === config.num_frames - 1) {
      await renderFrame(0);
      playVideo();
    } else {
      playingVideo ? pauseVideo() : playVideo();
    }
  });

  repeatButton.addEventListener('click', () => {
    repeatButton.classList.toggle('active');
    repeatActive = !repeatActive;
  });

  seekBar.addEventListener('input', (event) => {
    const frameIdx = Math.round(parseFloat((<HTMLInputElement>event.currentTarget).value));
    if (currentFrameIdx !== frameIdx) renderFrame(frameIdx, 'seek');
  }, { passive: true });

  seekBar.addEventListener('pointerdown', (event) => {
    seeking = true;
    seekBar.focus();
    if (playingVideo) {
      pauseVideo(false);
      seekingDuringPlayback = true;
    }
  }, { passive: true });

  seekBar.addEventListener('pointerup', (event) => {
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
      if (currentFrameIdx < videoFrames.length - 1) {
        renderFrame(currentFrameIdx + 1);
      }
      else if (repeatActive) {
        renderFrame(0, 'repeat');
      } else pauseVideo();
    }, (1 / 24) * 1000);
  };
  const pauseVideo = (shouldRender = true) => {
    if (playingVideo) {
      clearInterval(intervalId);
      audio.pause();
      playingVideo = false;
      if (shouldRender) renderFrame(currentFrameIdx);
    }
  }

  closeModalButton.addEventListener('click', (event) => {
    $('modal').hidden = true;
    document.body.style.overflowY = '';
  });

  function onVideoClicked(event: any) {
    const currentArtistFrame = $('artist-frame') as HTMLImageElement;
    const loadingIndicator = document.querySelector('#modal .loading-spinner') as HTMLElement;
    if (!currentArtistFrame || (currentArtistFrame.dataset.idx && currentFrameIdx !== parseInt(currentArtistFrame.dataset.idx))) {
      const profile = getProfileFromIndex(currentFrameIdx);
      const newArtistFrame = document.createElement('img');
      newArtistFrame.id = 'artist-frame';
      newArtistFrame.classList.add('artist-frame');
      newArtistFrame.alt = `${profile.name}'s high-res frame`;
      newArtistFrame.onload = () => {
        loadingIndicator.hidden = true;
        newArtistFrame.hidden = false;
      };
      newArtistFrame.dataset.idx = '' + currentFrameIdx;
      newArtistFrame.hidden = true;

      currentArtistFrame ? currentArtistFrame.replaceWith(newArtistFrame) : $('modal').append(newArtistFrame);
      loadingIndicator.hidden = false;

      newArtistFrame.src = config.artist_frames_path + (currentFrameIdx + 1) + '.png';
    }
    document.body.style.overflowY = 'hidden';
    $('modal').hidden = false;
    $('close-modal').focus();
  }
  //video.addEventListener('click', onVideoClicked);

  const scrollToProfile = (frameIdx: number, behavior: 'auto' | 'smooth' | undefined = 'auto') => {
    (smallScreen.matches ? window : profileList).scrollTo({
      top: frameIdx * listItemHeight,
      behavior
    });
  };

  renderFrame(currentFrameIdx);

  (async () => {
    if ('ResizeObserver' in window === false) {
      const module = await import('@juggle/resize-observer');
      window['ResizeObserver'] = module.ResizeObserver;
    }
    
    const ro = new ResizeObserver((entries: any) => {
      for (let entry of entries) {
        if (entry.contentRect.height > 0) {
          scrollToProfile($('about-page').hidden ? currentFrameIdx : config.num_frames - 1);
        } else if (document.scrollingElement) {
          document.scrollingElement.scrollTop = document.scrollingElement.scrollHeight;
        }
      }
    });
    ro.observe($('video-area'));
  })();

});