export const aFrame = () => {
  return new Promise((resolve) => requestAnimationFrame(resolve));
};

export const timeout = (seconds: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000)
  });
};

export const htmlToTemplate = (html) => {
  var template = document.createElement('template');
  html = html.trim();
  template.innerHTML = html;
  return template.content as DocumentFragment;
}

export const $ = (id: string) => document.getElementById(id) as HTMLElement || null;
