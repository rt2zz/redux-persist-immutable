import { fromJSGreedy } from "../fromJSGreedy";

const merge = (state, payload) => {
  const incomeState = fromJSGreedy(payload);
  return state.mergeDeep(incomeState);
}

export default merge;