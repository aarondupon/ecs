const FPS = 60;
export default class FPSController {
  constructor() {
    this.lock = this.checkfps;
    this.check = this.checkfps;
    this.dates = {};
  }

  checkfps(fps = FPS, id = 0) {
    if (!this.dates[id]) this.dates[id] = Date.now();
    let allow = false;
    const interval = 1000 / fps;
    const then = this.dates[id];
    const now = Date.now();
    const delta = now - then;
    if (delta > interval && this.dates[id]) {
      this.dates[id] = now - (delta % interval);
      allow = true;
    }
    return allow;
  }
}
