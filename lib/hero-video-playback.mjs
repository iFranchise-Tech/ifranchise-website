export const heroFilms = {
  hd: '/assets/home-hero/plan-to-presence-hd-v2.mp4',
  qhd: '/assets/home-hero/plan-to-presence-qhd-v2.mp4',
  portrait: '/assets/home-hero/plan-to-presence-portrait-v2.mp4',
};

export function selectHeroFilm(width, height, pixelRatio = 1, connection = '') {
  if (width <= 767 && height > width) return heroFilms.portrait;
  return connection !== '3g' && Math.max(width, height * 16 / 9) * pixelRatio > 1920
    ? heroFilms.qhd : heroFilms.hd;
}

/** Native looping first; recover only when an eligible background video stops progressing. */
export function createHeroPlayback(video, {
  canPlay, source, onUnavailable = /** @param {boolean} unavailable */ (unavailable) => { void unavailable; },
  now = () => Date.now(),
  every = (callback, delay) => setInterval(callback, delay),
  cancel = (timer) => clearInterval(timer),
  defer = (callback) => queueMicrotask(callback),
}) {
  let disposed = false, pending = false, blocked = false, generation = 0;
  let lastTime = video.currentTime, lastProgress = now(), lastReload = -Infinity, reloads = 0;
  const eligible = () => !disposed && canPlay();
  const markProgress = () => {
    if (video.currentTime !== lastTime) {
      lastTime = video.currentTime;
      lastProgress = now();
      reloads = 0;
      onUnavailable(false);
    }
  };
  const play = () => {
    if (!eligible() || blocked || pending || (!video.paused && !video.ended)) return;
    if (!video.getAttribute('src')) video.src = source();
    video.muted = true;
    if (video.ended) video.currentTime = 0;
    const attempt = ++generation;
    pending = true;
    Promise.resolve().then(() => {
      if (eligible() && attempt === generation) return video.play();
    }).catch((error) => {
      // A browser may require a real user gesture. Do not fight its autoplay policy.
      if (!disposed && attempt === generation && error?.name === 'NotAllowedError') blocked = true;
    }).finally(() => { if (attempt === generation) pending = false; });
  };
  const sync = (retryAutoplay = false) => {
    if (disposed) return;
    if (!eligible()) {
      ++generation;
      pending = false;
      if (!video.paused) video.pause();
      lastProgress = now();
      return;
    }
    if (retryAutoplay) {
      blocked = false;
      if (video.error) { reloads = 0; restart(); return; }
    }
    lastProgress = now();
    play();
  };
  const restart = () => {
    if (!eligible() || blocked) return;
    if (reloads >= 2) { onUnavailable(true); return; }
    if (now() - lastReload < 10000) return;
    lastReload = lastProgress = now();
    reloads++;
    generation++;
    pending = false;
    lastTime = 0;
    video.load();
    play();
  };
  const onPause = () => defer(play);
  const onEnded = () => { if (eligible()) { video.currentTime = 0; play(); } };
  const onCanPlay = () => { onUnavailable(false); play(); };
  const onError = () => {
    // Unsupported media keeps the sharp poster; transient network/decode failures may retry.
    if (video.error?.code === 4) { blocked = true; onUnavailable(true); }
    else restart();
  };
  const listeners = {pause:onPause, ended:onEnded, canplay:onCanPlay, timeupdate:markProgress, error:onError};
  for (const [event, handler] of Object.entries(listeners)) video.addEventListener(event, handler);
  const timer = every(() => {
    if (!eligible() || blocked) return;
    markProgress();
    if (now() - lastProgress >= 8000) restart();
    else if (video.paused || video.ended) play();
  }, 2000);
  return {
    sync,
    destroy() {
      disposed = true;
      generation++;
      cancel(timer);
      for (const [event, handler] of Object.entries(listeners)) video.removeEventListener(event, handler);
      video.pause();
    },
  };
}
