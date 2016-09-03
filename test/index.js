import test from 'ava'

import { autoRehydrate, persistStore } from '../lib'
import { REHYDRATE } from '../lib/constants'

import { compose, createStore } from 'redux'
import { Map } from 'immutable'

const rehydrate = (payload) => ({type: REHYDRATE, payload})
const createReducer = () => {
  return (state = Map({foo: 'fooVal', bar: [1, 2, 3]}), action) => {
    return state
  }
}

var finalCreateStore = compose(autoRehydrate())(createStore)

test('Restores Immutable Map', (t) => {
  let store = finalCreateStore(createReducer())
  store.dispatch(rehydrate({foo: 'newVal'}))
  let state = store.getState()
  console.log('new state', state)
  t.deepEqual(state.get('foo'), 'newVal')
})
