import { getTable, createTable } from './system';

declare interface IElement{
  uid: string;
  components:string[];
}

/**
 * composable component for craeteElement pipeline
 * @param component optioal initialize function
 */
const createComponent = (component?:(componentData:any) => any) => {
  const componentName = component.name;

  const tabel = getTable(componentName) || createTable(componentName);

  const wrapper = (props:any) => (element:IElement) => {
    // if (props) {
      const { uid } = element;
      const intializedProps = component ? component(props) : props;
      tabel.set(uid, intializedProps);

      // TODO: needs to be removed not needed!
      const comp =  {
        ...element,
        components: [...(element.components || []), componentName],
      };

      return comp;
    // }
    // const comp =  {
    //   ...element,
    //   components: [...(element.components || []), componentName],
    // };

    // return comp;
  };
  return wrapper;

};

export default createComponent;
