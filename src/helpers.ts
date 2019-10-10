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
