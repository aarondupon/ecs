import { update } from '../behaviors/ecs/composotionBehavior';
import {default as createSytstem} from './helpers/system'
const system  = createSytstem(update,'ECSComposityion')
export default system;