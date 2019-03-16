import component from '../../system/helpers/component';

export declare interface IBuffer{
  buffer:number[];
  type:string;
  size:number;
  stride:number;
  offset:number;
}

export interface IVertexArrayObject{
  index?:{buffer:number[]};
  [key: string]: IBuffer | {buffer:number[]};

} 

export declare interface IShader{
    vert:string;
    frag:string;
    uniforms: {[key: string]:any};
    binded?:boolean;
    bind:()=>{};
}
export declare interface IGeomComponent{
  buffers:IVertexArrayObject;
  shaders:IShader[];
}

function check(comp: IGeomComponent): comp is IGeomComponent {
  return ('shaders' in comp && 'buffers' in comp);
}

export function geometryBatch(geom:IGeomComponent) {
  if (!check(geom)) {
    console.error(`geometryBatch component: data ${geom} is is not valid`, geom);
  }
  return geom;
}

export default component(geometryBatch);
