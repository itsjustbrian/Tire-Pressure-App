import "./index.css";
import data from "./data.json";
import { $, supportsWebp, social_link_types } from "./helpers";

const minListWidth = 400;
const smallScreen = window.matchMedia("(max-width: 720px)");

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

  const artistFrames: any = data.artist_frames;
  const socialLinkTypes = social_link_types;
  let videoFrames: Array<any> = [];
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

  const createProfileImage = (url: string, username: string) => `
    <picture>
      <source type="image/webp" srcset="${url}-128.webp 128w, ${url}-256.webp 256w" sizes="40px"/>
      <source type="image/jpeg" srcset="${url}-128.jpg 128w, ${url}-256.jpg 256w" sizes="40px"/>
      <img class="profile-pic" src="${url}-128.png" alt="${username}'s profile picture" width="40px" height="40px"/>
    </picture>
  `;

  const logoMap: any = {
    'twitter': '<svg class="twitter" viewBox="75 75 250 250" xmlns="http://www.w3.org/2000/svg"><path d="m153.62 301.59c94.34 0 145.94-78.16 145.94-145.94 0-2.22 0-4.43-.15-6.63a104.36 104.36 0 0 0 25.59-26.55 102.38 102.38 0 0 1 -29.46 8.07 51.47 51.47 0 0 0 22.55-28.37 102.79 102.79 0 0 1 -32.57 12.45 51.34 51.34 0 0 0 -87.41 46.78 145.62 145.62 0 0 1 -105.71-53.59 51.33 51.33 0 0 0 15.88 68.47 50.91 50.91 0 0 1 -23.28-6.42v.65a51.31 51.31 0 0 0 41.15 50.28 51.21 51.21 0 0 1 -23.16.88 51.35 51.35 0 0 0 47.92 35.62 102.92 102.92 0 0 1 -63.7 22 104.41 104.41 0 0 1 -12.21-.74 145.21 145.21 0 0 0 78.62 23"/></svg>',
    'instagram': '<svg class="instagram" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg"><path d="M18 0c-4.889 0-5.501.02-7.421.108C8.663.196 7.354.5 6.209.945a8.823 8.823 0 00-3.188 2.076A8.83 8.83 0 00.945 6.209C.5 7.354.195 8.663.108 10.58.021 12.499 0 13.11 0 18s.02 5.501.108 7.421c.088 1.916.392 3.225.837 4.37a8.823 8.823 0 002.076 3.188c1 1 2.005 1.616 3.188 2.076 1.145.445 2.454.75 4.37.837 1.92.087 2.532.108 7.421.108s5.501-.02 7.421-.108c1.916-.088 3.225-.392 4.37-.837a8.824 8.824 0 003.188-2.076c1-1 1.616-2.005 2.076-3.188.445-1.145.75-2.454.837-4.37.087-1.92.108-2.532.108-7.421s-.02-5.501-.108-7.421c-.088-1.916-.392-3.225-.837-4.37a8.824 8.824 0 00-2.076-3.188A8.83 8.83 0 0029.791.945C28.646.5 27.337.195 25.42.108 23.501.021 22.89 0 18 0zm0 3.243c4.806 0 5.376.019 7.274.105 1.755.08 2.708.373 3.342.62.84.326 1.44.717 2.07 1.346.63.63 1.02 1.23 1.346 2.07.247.634.54 1.587.62 3.342.086 1.898.105 2.468.105 7.274s-.019 5.376-.105 7.274c-.08 1.755-.373 2.708-.62 3.342a5.576 5.576 0 01-1.346 2.07c-.63.63-1.23 1.02-2.07 1.346-.634.247-1.587.54-3.342.62-1.898.086-2.467.105-7.274.105s-5.376-.019-7.274-.105c-1.755-.08-2.708-.373-3.342-.62a5.576 5.576 0 01-2.07-1.346 5.577 5.577 0 01-1.346-2.07c-.247-.634-.54-1.587-.62-3.342-.086-1.898-.105-2.468-.105-7.274s.019-5.376.105-7.274c.08-1.755.373-2.708.62-3.342.326-.84.717-1.44 1.346-2.07.63-.63 1.23-1.02 2.07-1.346.634-.247 1.587-.54 3.342-.62 1.898-.086 2.468-.105 7.274-.105z"/><path d="M18 24.006a6.006 6.006 0 110-12.012 6.006 6.006 0 010 12.012zm0-15.258a9.252 9.252 0 100 18.504 9.252 9.252 0 000-18.504zm11.944-.168a2.187 2.187 0 11-4.374 0 2.187 2.187 0 014.374 0"/></svg>',
    'youtube': '<svg class="youtube" viewBox="0 0 158 110" xmlns="http://www.w3.org/2000/svg"><path d="M154.4 17.5c-1.8-6.7-7.1-12-13.9-13.8C128.2.5 79 .5 79 .5s-48.3-.2-60.6 3c-6.8 1.8-13.3 7.3-15.1 14C0 29.7.3 55 .3 55s-.3 25.3 3 37.5c1.8 6.7 8.4 12.2 15.1 14 12.3 3.3 60.6 3 60.6 3s48.3.2 60.6-3c6.8-1.8 13.1-7.3 14.9-14 3.3-12.1 3.3-37.5 3.3-37.5s-.1-25.3-3.4-37.5zM63.9 79.2V30.8L103.2 55 63.9 79.2z"/></svg>',
    'newgrounds': '<svg class="newgrounds" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 267 222"><path d="M264.4 19.45q-.35-.85-.65-1.6-1.15-2.75-2.6-5l-.5-.6q-2.3-2.7-4.7-4.8l-2.4-1.8q-.35-.2-.75-.45l-.8-.5q-1.4-.65-2.75-1.25-.3-.1-.55-.25-4.75-1.75-11.95-2.95h-50.6v.1h-9.1q-7.2 1.15-12 3-.2.1-.5.2-1.4.65-2.75 1.25-.35.2-.65.4-.5.3-.95.55l-2.35 1.85q-2.65 2.3-5.2 5.4-1.45 2.2-2.65 4.95-.3.75-.65 1.6-.05.2-.2.5-1.9 5.85-2.35 13.3l-.05 158.4q.5 3.05 1.1 5.7.8 3.55 1.85 6.25.1.2.2.55l1.3 2.7.3.5q.35.6.65 1.15l1.8 2.3q2.3 2.65 5.4 5.2 2.2 1.45 5 2.65.7.35 1.55.65.2.1.55.2 5.85 1.9 13.25 2.35l54.8-.15q7.4-.4 13.25-2.3.35-.1.55-.25.85-.3 1.55-.6 2.4-1.05 4.35-2.2.35-.25.65-.45 3.1-2.55 5.45-5.2l1.75-2.35q.45-.7 1-1.55.6-1.4 1.25-2.8.1-.3.2-.55.95-2.4 1.7-5.4.1-.35.15-.7 1-4.65.6-9.65v-78q.2-4.15-2.65-6.8-1.05-.85-2.45-1.6-.55-.25-1.2-.45-2.15-.7-4.95-.95-.7-.1-1.5-.15h-.55q-.7-.05-1.4-.05l-37.45.1q-2.85.55-4.8 2.55-.55.55-.95 1.25-.5.7-.9 1.55-.7 1.55-1.1 3.55-.55 2.7-.55 6.05-.2 18.35-.05 18.9.3 4.85 1.7 7.8.4 1.1.9 1.85.1.15.25.3.15.4.55.7 1.75 1.85 4.2 2.4l1.6.3h4.3v19.3q0 1.45-.3 2.65-.7 2.85-2.7 4.25l-.25.15q-1.9 1.1-4.75 1.2l-10.75-.1q-2.3-.25-3.8-1.25-2.1-1.4-2.85-4.25-.3-1.4-.3-3.2L194 56.25q0-1.85.3-3.2.45-1.8 1.5-2.95.55-.75 1.4-1.3 1.9-1.25 4.85-1.35l10.75.1q2.3.2 3.9 1.25.85.55 1.5 1.3.85 1.15 1.25 2.95.45 1.35.45 3.2V74.8q.5 2.85 2.45 4.75 1.25 1.05 2.85 1.9.4.25.85.3.85.35 1.8.55.9.25 2.1.45l22.05.5q.85-.05 1.65-.05.3-.05.55-.05 1.65-.15 3.1-.4 1.05-.2 1.9-.45.75-.2 1.45-.45l.9-.4q1.15-.55 2.1-1.15.35-.25.65-.55 1.8-1.8 2.3-4.25l.35-1.55v-.55l.1-30.1h-.1v-9.1-.95q-.4-7.4-2.35-13.3-.1-.3-.2-.5m-161.45-16q-.3-.1-.55-.25Q97.6 1.4 90.45.25h-74.4q-4.6 0-7.8 1.25-1.35.55-2.65 1.4-.2 0-.2.2-.65.55-1.15 1.05-.75.75-1.5 1.6l-.2.3Q.2 9.8.2 16.05v190.8q0 .45.05.9.3 5.15 2.5 8.55.45.55.75.85.85 1.05 1.9 2h.2q1.3.85 2.65 1.4.55.2 1.15.35.7.2 1.4.35 1.9.45 4.4.55h18.5q5-.4 8.4-2.65.3-.2.65-.55.8-.75 1.45-1.45.35-.3.75-.85 1.05-1.4 1.6-3.2.75-2.4 1-5.35 0-.45.05-.9V56.2q0-1.8.35-3.2.7-2.85 2.7-4.2 1.1-.65 2.45-.95 1.2-.45 2.55-.45h5.1v.15h.7v-.15l4.95.15q2.3.2 3.8 1.25 2.1 1.35 2.85 4.2.3 1.4.3 3.2v.55h.15V68.3h-.15v138.55l.1.9q.25 2.95 1 5.35.5 1.8 1.55 3.2.45.55.75.85.65.7 1.5 1.45.3.35.65.55 3.35 2.25 8.35 2.65H105.7q2.4-.1 4.35-.55 1.4-.3 2.55-.7 1.4-.55 2.65-1.4h.2q1.05-.95 1.9-2 .35-.3.75-.85 2.25-3.4 2.55-8.55V33.25q-.4-7.5-2.35-13.3-.1-.3-.2-.55-.35-.85-.65-1.55-1.15-2.75-2.6-5-2.55-3.1-5.2-5.4l-2.4-1.8q-.1-.1-.25-.15-2-1.2-4.05-2.05z"/></svg>'
  };

  const generateProfile = (profileData: any) => {
    const listItem = createListItem(profileData.username);
    const profilePic = (profileData.profile_pic && profileData.profile_pic.length) ? createProfileImage(profileData.profile_pic, profileData.username) :
      `<img class="profile-pic" src="https://avatars.io/twitter/${profileData.social_links.twitter}/medium"></img>`;
    listItem.innerHTML = `
      ${profilePic}
      <div class="line-item">
        <span class="primary-line-item-text">${profileData.username}<span>
        ${profileData.sub_title ? `<div class="secondary-line-item-text">${profileData.sub_title}</div>` : ''}
      </div>
      <div class="social-links">
        ${socialLinkTypes.map((type: any) => {
      const id = profileData.social_links[type.name];
      if (id && id.length)
        return `<a href="${type.link(id)}" target="_blank" class="social-icon">
                    ${logoMap[type.name]}
                  </a>`;
    }).join('')}
      </div>
    `;
    return listItem;
  };

  const profileList = $('profile-list') as HTMLUListElement;
  artistFrames.forEach((frame: Object, idx: number) => {
    const profile = generateProfile(frame);
    profile.dataset.idx = '' + idx;
    profileList.append(profile, $('tpplogo'));
  });

  // Me
  profileList.append(generateProfile({
    username: 'justbrian',
    social_links: { twitter: 'ReefBlowPlay' },
    sub_title: 'App developer'
  }), $('tpplogo'));

  // Load artistFrames and map image frames to artist frames and vice versa
  const webpsupported = await supportsWebp();
  const maxVideoSize = Math.max(screen.availHeight > 720 ? screen.availHeight - minListWidth : screen.availHeight,
    screen.availWidth > 720 ? screen.availWidth - minListWidth : screen.availWidth);
  let imageIdx = 0;
  for (let i = 0; i < artistFrames.length; i++) {
    artistFrames[i].imageIdx = imageIdx;
    for (let j = 0; j < artistFrames[i].num_video_frames; j++) {
      videoFrames[imageIdx] = { image: new Image(), artistIdx: i };
      const image = videoFrames[imageIdx].image;
      image.id = 'video';
      image.idx = imageIdx;
      image.finalSrc = artistFrames[i].img_placeholder;
      image.src = `/assets/video_frames/frame${i + 1}-${maxVideoSize < 480 ? '320' : '480'}.${webpsupported ? 'webp' : 'jpg'}`;
      image.onload = function changeSrc() {
        this.finalSrc = this.src;
        if (currentImageIdx === this.idx) ($('video') as HTMLImageElement).src = this.finalSrc;
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

      // Change frame
      video.src = videoFrames[imageIdx].image.finalSrc;
      // video.replaceWith(videoFrames[imageIdx].image);
      // video.removeEventListener('click', onVideoClicked);
      // video = videoFrames[imageIdx].image;
      // video.addEventListener('click', onVideoClicked);

      // Hide the about page if it's active
      if (!$('about-page').hidden) await showAboutPage(false);

      // Seek audio
      if (!playingVideo || source === 'seek') audio.currentTime = (1 / 24) * imageIdx;

      // Change selected profile
      $('profile-' + currentArtistData.username).classList.remove('selected');
      //$('profile-' + currentArtistData.username).style.backgroundColor = "rgba(255, 255, 255, 0)";
      const selectedProfile = $('profile-' + newArtistData.username);
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
        $('profile-' + currentArtistData.username).classList.remove('selected');
        $('profile-justbrian').classList[show ? 'add' : 'remove']('selected');
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
    document.body.style.overflowY = '';
  });

  function onVideoClicked(event: any) {
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
    document.body.style.overflowY = 'hidden';
    $('image-viewer').hidden = false;
    $('close-image-viewer').focus();
  }
  video.addEventListener('click', onVideoClicked);

  const scrollToProfile = (artistIdx: number, behavior: 'auto' | 'smooth' | undefined = 'auto') => {
    (smallScreen.matches ? window : $('profile-list')).scrollTo({
      top: artistIdx * 56,
      behavior
    });
  };

  // const onMediaQuery = (event: MediaQueryListEvent | MediaQueryList) => {
  //   $(event.matches ? 'profile-list' : 'main-content').append($('video-controls'));
  // };
  // onMediaQuery(smallScreen);
  // smallScreen.addEventListener('change', onMediaQuery);

  // const ro = new ResizeObserver((entries: any) => {
  //   for (let entry of entries) {
  //     if (entry.contentRect.height > 0) {
  //       document.body.style.cssText = `scroll-padding-top: ${entry.contentRect.height}px`;
  //       document.documentElement.style.cssText = `scroll-padding-top: ${entry.contentRect.height}px`; // For firefox
  //       scrollToCurrentProfile();
  //     } else if (document.scrollingElement) {
  //       document.scrollingElement.scrollTop = document.scrollingElement.scrollHeight;
  //     }
  //   }
  // });
  // ro.observe($('video-area'));

  window.onresize = () => {
    scrollToProfile($('about-page').hidden ? imageIdxToArtistIdx(currentImageIdx) : artistFrames.length);
  }


  renderFrame(currentImageIdx);

});