import {
  autoRehydrate as baseAutoRehydrate,
  createPersistor as baseCreatePersistor,
  createTransform,
  getStoredState,
  persistStore as basePersistStore,
  purgeStoredState
} from 'redux-persist';

import * as operators from './operators';
import { stateReconciler } from './reconciler';

const autoRehydrate = (config, ...args) => {
  return baseAutoRehydrate({...config, stateReconciler}, ...args);
};

const createPersistor = (store, config, ...args) => {
  return baseCreatePersistor(store, {...config, ...operators}, ...args);
};

const persistStore = (store, config, ...args) => {
  return basePersistStore(store, {...config, ...operators}, ...args);
};

export {
  autoRehydrate,
  createPersistor,
  createTransform,
  getStoredState,
  persistStore,
  purgeStoredState
};
