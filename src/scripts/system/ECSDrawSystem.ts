import { update } from '../behaviors/ecs/drawBehavior';
import {default as createSytstem} from './helpers/system'
const drawSystem = createSytstem(update)
export default drawSystem;
