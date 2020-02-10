const config = require("../build-config.json");

import "./index.css";
import lazySizes from "lazysizes";
import { $, supportsWebp, social_link_types, getProfileElement } from "./helpers";

lazySizes.cfg.loadMode = 1;
lazySizes.cfg.expand = 300;

const minListWidth = 400;
const responsiveWidth = 800
const smallScreen = window.matchMedia(`(max-width: ${responsiveWidth}px)`);

const socialLinkTypes = social_link_types;
let videoFrames: Array<any> = [];
let currentImageIdx: number = 0;
let playingVideo = false;
let seeking = false;
let seekingDuringPlayback = false;
let muted = true;

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

  let video = $('video') as HTMLImageElement;
  const audio = $('audio') as HTMLAudioElement;
  const volumeControl = $('volume-control') as HTMLButtonElement;
  const frameForwardButton = $('frame-forward') as HTMLButtonElement;
  const frameBackwardButton = $('frame-backward') as HTMLButtonElement;
  const playPauseButton = $('pause-play-control') as HTMLButtonElement;
  const seekBar = $('seek-bar') as HTMLInputElement;
  const closeImageViewerButton = $('close-image-viewer') as HTMLButtonElement;
  const profileList = $('profile-list') as HTMLElement;
  const frameCount = $('frame-count');

  const htmlToElement = (html) => {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
  }

  const createVideoFrameElement = () => {
    html`<picture id="video" class="video-frame">
      <source type="image/webp" srcset="${createSrcSet('webp')}" data-sizes="${sizes}"/>
      <source type="image/jpeg" srcset="${createSrcSet('jpg')}" data-sizes="${sizes}"/>
      <img class="video-frame" data-src="${createSrcFile(path, Math.max(...srcSizes), 'jpg')}" alt="${alt}" width="${width}" height="${height}"/>
    </picture>`
  };


  const videoFrames = [];
  for (let i = 0; i < config.num_frames; i++) {
    document.createElement('picture');
    videoFrames.push()
  }

  // Load artistFrames and map image frames to artist frames and vice versa
  const webpsupported = await supportsWebp();
  const maxVideoSize = Math.max(screen.availHeight > responsiveWidth ? screen.availHeight - minListWidth : screen.availHeight,
    screen.availWidth > responsiveWidth ? screen.availWidth - minListWidth : screen.availWidth);
  let imageIdx = 0;
  for (let i = 0; i < artistFrames.length; i++) {
    artistFrames[i].imageIdx = imageIdx;
    for (let j = 0; j < artistFrames[i].num_video_frames; j++) {
      videoFrames[imageIdx] = { image: new Image(), artistIdx: i };
      const image = videoFrames[imageIdx].image;
      image.id = 'video';
      image.idx = imageIdx;
      image.src = `/assets/video_frames/frame${i + 1}-${maxVideoSize < 480 ? '320' : '480'}.${webpsupported ? 'webp' : 'jpg'}`;
      image.alt = `${artistFrames[i].username}'s fram`;
      image.onload = function changeSrc() {
        if (currentImageIdx === this.idx) {
          video.src = this.src;
        }
      };
      videoFrames[imageIdx].artistIdx = i;
      imageIdx++;
    }
  }

  const imageIdxToArtistIdx = (imageIdx: number) => videoFrames[imageIdx].artistIdx;
  const artistIdxToImageIdx = (artistIdx: number) => artistFrames[artistIdx].imageIdx;



  // for (let i = 31; i < 54; i++) {
  //   //artistFrames[i].time_displayed = i * (2.483 / 53);
  //   //artistFrames[i].username += i;
  // }

  // console.log(JSON.stringify(artistFrames));

  // const offscreen = (document.getElementById('video') as HTMLCanvasElement).transferControlToOffscreen();
  // const worker = new Worker('static/video-worker.js');
  // worker.postMessage({ canvas: offscreen }, [offscreen]);

  const renderFrame = (imageIdx: number, source?: String) => {
    const artistIdx = imageIdxToArtistIdx(imageIdx);
    const currentArtistData = artistFrames[imageIdxToArtistIdx(currentImageIdx)];
    const newArtistData = artistFrames[artistIdx];
    currentImageIdx = imageIdx;

    requestAnimationFrame(async () => {

      // Change frame
      video.src = videoFrames[imageIdx].image.src;
      if (video.hidden) video.hidden = false;
      // video.replaceWith(videoFrames[imageIdx].image);
      // video.removeEventListener('click', onVideoClicked);
      // video = videoFrames[imageIdx].image;
      // video.addEventListener('click', onVideoClicked);

      // Hide the about page if it's active
      if (!$('about-page').hidden) await showAboutPage(false);

      // Seek audio
      if (!playingVideo || source === 'seek') audio.currentTime = (1 / 24) * imageIdx;

      // Change selected profile
      getProfileElement(currentArtistData.username).classList.remove('selected');
      //$('profile-' + currentArtistData.username).style.backgroundColor = "rgba(255, 255, 255, 0)";
      const selectedProfile = getProfileElement(newArtistData.username);
      selectedProfile.classList.add('selected');
      //selectedProfile.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
      //selectedProfile.scrollIntoView({ behavior: playingVideo || seekingDuringPlayback || source === 'seek' ? 'auto' : 'smooth' });
      scrollToProfile(artistIdx, playingVideo || seekingDuringPlayback || source === 'seek' ? 'auto' : 'smooth');


      // Enable/disable buttons
      let frameForwardButtonDisabled = artistIdx === artistFrames.length - 1;
      let frameBackwardButtonDisabled = artistIdx === 0;
      if (playingVideo || seekingDuringPlayback) frameForwardButtonDisabled = frameBackwardButtonDisabled = true;
      frameForwardButton.disabled = frameForwardButtonDisabled;
      frameBackwardButton.disabled = frameBackwardButtonDisabled;

      // Change seekbar
      if (!seeking && source !== 'seek') seekBar.value = `${imageIdx}`;

      // Change play/pause button
      if (playingVideo) playPauseButton.classList.remove('paused');
      else playPauseButton.classList.add('paused');

      // Set frame number
      //frameCount.innerText = `${(artistIdx + 1).toString().padStart(2, '0')}/${artistFrames.length}`;
    });
  };

  const showAboutPage = (show = true) => {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        const currentArtistData = artistFrames[imageIdxToArtistIdx(currentImageIdx)];
        getProfileElement(currentArtistData.username).classList.remove('selected');
        getProfileElement('justbrian').classList[show ? 'add' : 'remove']('selected');
        $('main-content').classList[show ? 'add' : 'remove']('about-page-active');
        $('about-page').hidden = !show;
        $('video-area').hidden = show;
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
    if (targetNode.id === 'profile-justbrian') showAboutPage();
    else if (targetNode.dataset.idx) renderFrame(artistIdxToImageIdx(parseInt(targetNode.dataset.idx)));
  });

  volumeControl.addEventListener('click', (event) => {
    muted = !muted;
    audio.muted = muted;
    muted ? volumeControl.classList.add('muted') : volumeControl.classList.remove('muted');
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

  seekBar.addEventListener('input', (event) => {
    const imageIdx = Math.round(parseFloat((<HTMLInputElement>event.currentTarget).value));
    // convert and then convert back to get starting image frame for artist
    if (currentImageIdx !== imageIdx) renderFrame(artistIdxToImageIdx(imageIdxToArtistIdx(imageIdx)), 'seek');
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
    document.body.style.overflowY = '';
  });

  function onVideoClicked(event: any) {
    const fileName = artistFrames[imageIdxToArtistIdx(currentImageIdx)].username.replace(/ /g, '_') + '.png';
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
    document.body.style.overflowY = 'hidden';
    $('image-viewer').hidden = false;
    $('close-image-viewer').focus();
  }
  video.addEventListener('click', onVideoClicked);

  const scrollToProfile = (artistIdx: number, behavior: 'auto' | 'smooth' | undefined = 'auto') => {
    (smallScreen.matches ? window : profileList).scrollTo({
      top: artistIdx * 60,
      behavior
    });
  };

  const ro = new ResizeObserver((entries: any) => {
    for (let entry of entries) {
      if (entry.contentRect.height > 0) {
        scrollToProfile($('about-page').hidden ? imageIdxToArtistIdx(currentImageIdx) : artistFrames.length);
      } else if (document.scrollingElement) {
        document.scrollingElement.scrollTop = document.scrollingElement.scrollHeight;
      }
    }
  });
  ro.observe($('video-area'));

  renderFrame(currentImageIdx);

});