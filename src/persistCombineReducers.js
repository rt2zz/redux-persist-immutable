import { combineReducers } from 'redux-immutable';
import { Map } from 'immutable';
import persistReducer from './persistReducers';
import autoMergeLevel2 from './stateReconciler/autoMergeLevel2';

export default function persistCombineReducers(config, reducers) {
  config.stateReconciler = config.stateReconciler || autoMergeLevel2;
  if (!reducers._persist) {
    reducers = { ...reducers, _persist: (state = Map({})) => state }
  }
  return persistReducer(config, combineReducers(reducers))
}