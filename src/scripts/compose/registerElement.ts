import register,{registerOnce} from '../system/register';

//TODO: REGISTRATION should by dynamic. add or removes eement from array if neeed (value change)
const registerElement = (element,once:boolean = false) => {
  return once ? registerOnce(element) : register(element) 
};
export default registerElement;
