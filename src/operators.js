import { Map } from 'immutable';

export const _stateInit = new Map();

export function _stateIterator(state, callback) {
  return state.forEach(callback);
}

export function _stateGetter(state, key) {
 return state.get(key);
};

export function _stateSetter(state, key, value) {
 return state.set(key, value);
};
