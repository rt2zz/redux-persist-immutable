
const merge = (state, payload) => {
  return state.mergeDeepWith((oldVal, newVal) => newVal || oldVal, payload);
}

export default merge;