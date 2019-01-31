
export default function createAnimate(shedular = () => true) {
  return function animate(fps, render, repeat) {
    let count = 0;
    function loop() {
      if (shedular(fps)) {
        render();
        count += 1;
      }
      if (repeat === undefined || count !== repeat) {
        window.requestAnimationFrame(loop);
      }
    }
    window.requestAnimationFrame(loop);
  };
}
