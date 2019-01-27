import { fromJSGreedy } from '../fromJSGreedy';

const merge = (state, payload) => {
  return state.merge(fromJSGreedy(payload))
}

export default merge;
