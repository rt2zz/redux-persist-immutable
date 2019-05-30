import test from 'ava'

import { persistReducer } from '../lib'
import { REHYDRATE } from 'redux-persist'
import storage from 'redux-persist/lib/storage';

import { compose, createStore } from 'redux'
import { Map, List } from 'immutable'

const rehydrate = (key, payload) => ({ type: REHYDRATE, key, payload })

const createReducer = () => {
  return (state = Map({ foo: 'fooVal', bar: List([1, 2, 3]) }), action) => {
    return state
  }
}

var finalCreateStore = compose()(createStore)

test('Restores Immutable Map', (t) => {
  let store = finalCreateStore(persistReducer({ key: "root", storage }, createReducer()));
  store.dispatch(rehydrate("root", { foo: 'newVal' }));
  let state = store.getState();
  t.deepEqual(state.get('foo'), 'newVal');
})
