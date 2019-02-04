import { update } from '../behaviors/ecs/translateBehavior';
import {default as createSytstem} from './helpers/system'
const system  = createSytstem(update,'ECSTranslate')
export default system;