import { getTable, createTable } from './system';

declare interface IElement{
  uid: string;
  behaviors:string[];
}

/**
 * composable behavior for craeteElement pipeline
 * @param behavior optioal initialize function
 */
const createBehavior = (behavior?:(behaviorData:any) => any) => {
  const behaviorName = behavior.name;

  const tabel = getTable(behaviorName) || createTable(behaviorName);

  const wrapper = (props:any) => (element:IElement) => {
    if (props) {
      const { uid } = element;
      const intializedProps = behavior ? behavior(props) : props;
      tabel.set(uid, intializedProps);
      
      // TODO: needs to be removed not needed!
      const comp =  {
        ...element,
        behaviors: [...(element.behaviors || []), behaviorName],
      };
      
      return comp;
    }
    const comp =  {
      ...element,
      behaviors: [...(element.behaviors || []), behaviorName],
    };
    debugger;
    return comp;
  };
  return wrapper;

};

export default createBehavior;
