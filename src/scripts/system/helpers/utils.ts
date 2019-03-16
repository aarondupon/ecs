export const connect = (state:any, props:any) => {
    return Object.keys(props).reduce((obj:any, key:string) => {
      obj[key] = (...args) => props[key](state, ...args);
      return obj;
    },                        {});
  };



export const jsUcfirst = (string) => string.charAt(0).toUpperCase() + string.slice(1);


export const getBehaviorName  = (path) => {
  return path.match(/([^\/]+)(?=Behavior\.\w+$)/)[0];
};

export const getComponentName  = (path) => {
  return path.match(/([^\/]+)(?=Component\.\w+$)/)[0];
};

export const getSystemName = (filename) =>
`ESC${jsUcfirst(filename.replace('./', '').replace('.ts', '')).replace('Behavior', 'System')}`;


