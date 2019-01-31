export default function mesure(shedular = () => true) {
  return (name, func) => {
    const start = window.performance.now();
    func();
    const end = window.performance.now();
    const dur = end - start;
    shedular() && console.log(name, dur);
  };
}
