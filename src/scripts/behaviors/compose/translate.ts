import { vec3} from 'gl-matrix';

const translate = config => (metods) => {
  const comp  = {
    ...metods,
    getTranslate: { value: getTranslate },
    setTranslate: { value: setTranslate },
    translate: { value:undefined },
  };
  return comp;
};

export function setTranslate(translate: vec3): vec3 {
  this.translate = vec3.clone(translate);
  return this.translate;
}

export function   getTranslate(): vec3 {
// Defensive clone
  return vec3.clone(this.translate || [0, 0, 0]);
}

export default translate;
