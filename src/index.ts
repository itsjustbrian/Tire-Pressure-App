const config = require("../build-config");
const { createPicture } = require("../utils/common-utils");

import "./index.css";
import lazySizes from "lazysizes";
import { $, htmlToTemplate } from "./helpers";
import RangeTouch from 'rangetouch';

lazySizes.cfg.loadMode = 1;
lazySizes.cfg.expand = 300;

const listItemHeight = 56;
const responsiveWidth = 900
const smallScreen = window.matchMedia(`(max-width: ${responsiveWidth}px)`);

const developerId = 'yeahjustbrian';
const backgroundArtistId = 'voidknife';
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
    apiKey: "AIzaSyA0NDsEdwCR6QK5oRUE-pW_nTRTeXs-ZYI",
    authDomain: "projecttirepressure.firebaseapp.com",
    databaseURL: "https://projecttirepressure.firebaseio.com",
    projectId: "projecttirepressure",
    storageBucket: "projecttirepressure.appspot.com",
    messagingSenderId: "267245128918",
    appId: "1:267245128918:web:bf74c4fa507de14c4b4d77",
    measurementId: "G-R0XT1CYQVF"
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
  const profileList = $('profile-list') as HTMLElement;
  const videoFrameLoadingSpinner = document.querySelector('#video-area .loading-spinner') as HTMLElement;
  videoFrameLoadingSpinner.hidden = false;
  new RangeTouch(seekBar, { thumbWidth: 19 });

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
      sizes: '(min-width: 901px) calc(100vw - 325px), 100vw',
      width: 2100,
      height: 900,
      alt: `${profile.name}'s frame`
    };
    const videoFrameTemplate = htmlToTemplate(createPicture(framePictureOptions));
    const imgElement = videoFrameTemplate.querySelector('img') as HTMLElement;
    const videoFrameElement = videoFrameTemplate.firstChild as HTMLElement;
    imgElement.style.opacity = '0';
    imgElement.classList.add('video');
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

  const openAboutPage = () => {
    const modal = new Modal();
    modal.overflow = 'auto';
    const aboutPage = document.createElement('div');
    aboutPage.id = 'about-page';
    aboutPage.innerHTML = `
      <h1>Tire Pressure App</h1>
      <h2>Made with ❤ by <a href="https://twitter.com/${developerId}" target="_blank" rel="noopener">justbrian</a></h2>
      <h3>Pro tips:</h3>
      <ul>
        <li>Click on the video when it's paused on a frame to see that drawing in full resolution</li>
        <li>Click on a profile picture to go to that artist's social media</li>
      </ul>
      <h3>Experiencing poor performance or visual glitches?</h3>
      <p>The Tire Pressure App is at its best and fanciest and fastest on Chrome/Chromium browser(s) on desktops and modern phones. Keep in mind every browser on iPhone/iOS is actually just Safari in disguise, and Safari on iPhone/iOS really SUCKS at handling the raw power of the official Tire Pressure Project App</p>
      <h3>Something horribly broken on Microsoft Edge?</h3>
      <p>You can try using the <a href="https://www.microsoft.com/en-us/edge" target="_blank" rel="noopener">new Edge</a>, which should work better</p>
      <h3>Have a question? Or a problem with the site you'd like me to know about?</h3>
      <p>Feel free to DM or @ me on <a href="https://twitter.com/${developerId}" target="_blank" rel="noopener">my Twitter</a></p>
      <h2>Acknowledgements</h2>
      <p><a href="https://twitter.com/tomfulp" target="_blank" rel="noopener">@tomfulp</a> Thank you for your endorsement</p>
      <p><a href="https://twitter.com/ivana1mighty" target="_blank" rel="noopener">@ivana1mighty</a> Thank you for your support and creation of the HTML5 player</p>
      <p><a href="https://twitter.com/jetseeofficial" target="_blank" rel="noopener">@jetseeofficial</a> Thank you for all the voice work</p>
      <p>A big thank you to all of the artists who made this possible and anyone who supported us</p>
      <p>Thank you (nazar amulet emoji) Nazar Amulet for bringing light to an otherwise dark and demon-ridden path</p>
      <p>Thanks to God, Buddha, Boddah, Yeezus, Jeezus, Larry, Curly, and Moe</p>
      <h5>© 2020 TPP LLC Inc.</h5>
    `;
    modal.content = aboutPage;
    modal.header.style.backgroundColor = 'rgba(37, 53, 87, 0.9)';
    modal.open();
  };

  profileList.addEventListener('click', (event) => {
    let targetNode: HTMLElement | null = event.target as HTMLElement;
    while (true) {
      if (!targetNode || targetNode.nodeName === 'A') return; // Ignore if social link clicked
      if (targetNode.nodeName === 'ITEM') break;
      targetNode = targetNode.parentElement;
    }

    analytics.logEvent('profile_selected', { name: targetNode.dataset.name, id: targetNode.id });

    if (targetNode.dataset.idx)
      renderFrame((parseInt(targetNode.dataset.idx)))
    else if (targetNode.id === developerId)
      openAboutPage();
    else if (targetNode.id === backgroundArtistId) 
      openModalWithImage(`${config.background_path}${targetNode.id}-${config.image_sets.background.sizes[0]}.jpg`, 'Full background image');
    else
      openModalWithImage(`${config.artist_frames_path}${targetNode.id}.png`, `${targetNode.dataset.name}'s high-res frame`);
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
    playingVideo ? pauseVideo() : playVideo();
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
  const playVideo = async () => {
    if (playingVideo) return;
    playingVideo = true;
    if (currentFrameIdx === config.num_frames - 1) await renderFrame(0, 'repeat');
    audio.play();
    intervalId = setInterval(() => {
      if (currentFrameIdx < videoFrames.length - 1) renderFrame(currentFrameIdx + 1);
      else if (repeatActive) renderFrame(0, 'repeat');
      else pauseVideo();
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

  class Modal {
    private _content: HTMLElement;
    constructor() {
      this._content = document.createElement('div') as HTMLElement;
      this._content.id = 'modal';
      this._content.hidden = true;
      this._content.innerHTML = `
        <div id="modal-header">
          <button id="close-modal" class="icon-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              <path d="M0 0h24v24H0z" fill="none" />
            </svg>
          </button>
        </div>
      `;
      this.close = this.close.bind(this);
      this.onModalClicked = this.onModalClicked.bind(this);
    }

    set content(userContent) {
      this._content.append(userContent);
    }

    set overflow(overflow) {
      this._content.style.overflowY = overflow;
    }

    get header() {
      return this._content.querySelector('#modal-header') as HTMLElement;
    }

    get closeButton() {
      return this._content.querySelector('#close-modal') as HTMLElement;
    }

    onModalClicked(event) {
      if (event.srcElement.id === 'modal') this.close();
    }

    open() {
      this.closeButton.addEventListener('click', this.close);
      this._content.addEventListener('click', this.onModalClicked);
      document.body.style.overflowY = 'hidden';
      this._content.style.opacity = '0';
      this._content.style.transform = 'translate3d(0, 40px, 0)';
      this._content.style.transition = 'none';
      document.body.append(this._content);
      this._content.hidden = false;
      this.closeButton.focus();
      animationFramePromise(() => {
        this._content.style.opacity = '1';
        this._content.style.transform = 'translate3d(0, 0, 0)';
        this._content.style.transition = 'opacity 0.4s ease 0s, transform 0.4s ease 0s';
      });
    }

    close() {
      this.closeButton.removeEventListener('click', this.close);
      this._content.removeEventListener('click', this.onModalClicked);
      this._content.addEventListener('transitionend', () => {
        this._content.remove();
        this._content.hidden = true;
        document.body.style.overflowY = '';
      }, { once: true });
      this._content.style.opacity = '0';
      this._content.style.transform = 'translate3d(0, 40px, 0)';
      this._content.style.transition = 'opacity 0.2s ease 0s, transform 0.2s ease 0s';
    }
  }

  function onVideoClicked(event: any) {
    const profile = getProfileFromIndex(currentFrameIdx);
    analytics.logEvent('frame_selected', { name: profile.name, id: profile.id });
    openModalWithImage(`${config.artist_frames_path}${currentFrameIdx + 1}.png`, `${profile.name}'s high-res frame`);
  }

  const openModalWithImage = (src, alt) => {
    const modal = new Modal();
    //modal.header.style.minHeight = '0';
    const modalContent = document.createDocumentFragment();

    const loadingSpinnerOptions = {
      path: config.image_sets.logos.path + 'tpp_loading_spinner',
      srcSizes: config.image_sets.logos.sizes,
      sizes: '100px',
      width: 100,
      height: 100,
      alt: 'Loading spinner',
      imgClass: 'loading-spinner',
      baseFormat: 'png'
    };
    const loadingSpinner = htmlToTemplate(createPicture(loadingSpinnerOptions)).firstChild as HTMLElement;
    loadingSpinner.hidden = false;

    modalContent.append(loadingSpinner);

    const newImg = document.createElement('img');
    newImg.id = 'modal-image';
    newImg.classList.add('modal-image');
    newImg.alt = alt;
    newImg.hidden = true;
    newImg.src = src;
    newImg.style.willChange = 'transform, opacity';
    newImg.style.zIndex = '-1';
    newImg.decode().then(() => {
      newImg.hidden = false;
      loadingSpinner.hidden = true;
    });

    modalContent.append(newImg);

    modal.content = modalContent;
    modal.open();
  };

  const scrollToProfile = (frameIdx: number, behavior: 'auto' | 'smooth' | undefined = 'auto') => {
    (smallScreen.matches ? window : profileList).scrollTo({
      top: frameIdx * listItemHeight,
      behavior
    });
  };

  // Kick it off
  renderFrame(currentFrameIdx);

  (async () => {
    if (!('scrollBehavior' in document.documentElement.style)) {
      const smoothScroll = await import('smoothscroll-polyfill');
      smoothScroll.polyfill();
    }
  })();

  // (async () => {
  //   if ('ResizeObserver' in window === false) {
  //     const module = await import('@juggle/resize-observer');
  //     window['ResizeObserver'] = module.ResizeObserver;
  //   }
    
  //   const ro = new ResizeObserver((entries: any) => {
  //     for (let entry of entries) {
  //       if (entry.contentRect.height > 0) {
  //         scrollToProfile(currentFrameIdx);
  //       } else if (document.scrollingElement) {
  //         document.scrollingElement.scrollTop = document.scrollingElement.scrollHeight;
  //       }
  //     }
  //   });
  //   ro.observe($('video-area'));
  // })();

});