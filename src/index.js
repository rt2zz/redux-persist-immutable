import {
  autoRehydrate as baseAutoRehydrate,
  createPersistor as baseCreatePersistor,
  createTransform,
  getStoredState,
  persistStore as basePersistStore,
  purgeStoredState
} from 'redux-persist';

import immutableTransform from 'redux-persist-transform-immutable'
import * as operators from './operators';
import { stateReconciler } from './reconciler';

const extendConfig = (config) => {
  transforms = [...config.transforms, immutableTransform]
  return {...config, ...operators, stateReconciler, transforms}
}

const autoRehydrate = (config, ...args) => {
  return baseAutoRehydrate(extendConfig(config), ...args);
};

const createPersistor = (store, config, ...args) => {
  return baseCreatePersistor(store, extendConfig(config), ...args);
};

const persistStore = (store, config, ...args) => {
  return basePersistStore(store, extendConfig(config), ...args);
};

export {
  autoRehydrate,
  createPersistor,
  createTransform,
  getStoredState,
  persistStore,
  purgeStoredState
};
