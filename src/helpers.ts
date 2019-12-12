export const aFrame = () => {
  return new Promise((resolve) => requestAnimationFrame(resolve));
};

export const timeout = (seconds: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000)
  });
};

export const $ = (id: string) => {
  return document.getElementById(id) as HTMLElement || null;
};

export const getProfileElement = (username: String) => $('profile-' + username.replace(/ /g, '-'));

export async function supportsWebp() {
  if (!self.createImageBitmap) return false;

  const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  const blob = await fetch(webpData).then(r => r.blob());
  return createImageBitmap(blob).then(() => true, () => false);
}

export const social_link_types = [
  {
    name: "twitter",
    link: (id: string) => `https://twitter.com/${id}`
  },
  {
    name: "youtube",
    link: (id: string) => `https://www.youtube.com/user/${id}`
  },
  {
    name: "instagram",
    link: (id: string) => `https://www.instagram.com/${id}`
  },
  {
    name: "newgrounds",
    link: (id: string) => `https://${id}.newgrounds.com`
  }
];
