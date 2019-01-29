import { fromJSGreedy } from "../fromJSGreedy";

const merge = (state, payload) => {
  const incomeState = fromJSGreedy(payload);
  return state.mergeDeepWith((oldVal, newVal) => newVal || oldVal, incomeState);
}

export default merge;