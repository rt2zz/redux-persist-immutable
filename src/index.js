import {
  autoRehydrate as baseAutoRehydrate,
  createPersistor as baseCreatePersistor,
  createTransform,
  getStoredState as baseGetStoredState,
  persistStore as basePersistStore,
  purgeStoredState
} from 'redux-persist'

import immutableTransform from 'redux-persist-transform-immutable'
import * as operators from './operators'
import { stateReconciler } from './reconciler'

const extendConfig = (config) => {
  let incomingTransforms = config.transforms || []
  let records = config.records || null
  let transforms = [...incomingTransforms, immutableTransform({ records })]
  return {...config, ...operators, stateReconciler, transforms}
}

const autoRehydrate = (config = {}, ...args) => {
  return baseAutoRehydrate(extendConfig(config), ...args)
}

const createPersistor = (store, config = {}, ...args) => {
  return baseCreatePersistor(store, extendConfig(config), ...args)
}

const persistStore = (store, config = {}, ...args) => {
  return basePersistStore(store, extendConfig(config), ...args)
}

const getStoredState = (config = {}, ...args) => {
  return baseGetStoredState(extendConfig(config), ...args)
}

export {
  autoRehydrate,
  createPersistor,
  createTransform,
  getStoredState,
  persistStore,
  purgeStoredState
}
