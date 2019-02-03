export const connect = (state:any, props:any) => {
    return Object.keys(props).reduce((obj:any, key:string) => {
      obj[key] = (...args) => props[key](state, ...args);
      return obj;
    },                        {});
  };