'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getStoredState;

var _reduxPersist = require('redux-persist');

var _immutable = require('immutable');

var defaultDeserialize = function defaultDeserialize(x) {
  return x;
};

function getStoredState(config) {
  var transforms = config.transforms || [];
  var storageKey = '' + (config.keyPrefix !== undefined ? config.keyPrefix : _reduxPersist.KEY_PREFIX) + config.key;
  var storage = config.storage;
  var debug = config.debug;
  var deserialize = config.serialize === false ? function (x) {
    return x;
  } : defaultDeserialize;
  return storage.getItem(storageKey).then(function (serialized) {
    if (!serialized) return undefined;else {
      try {
        var state = (0, _immutable.Map)();
        var rawState = deserialize(JSON.parse(serialized));
        var rawStateKeys = Object.keys(rawState);
        rawStateKeys.forEach(function (key) {
          state = state.set(key, transforms.reduceRight(function (subState, transformer) {
            return transformer.out(subState, key, rawState);
          }, rawState[key]));
        });
        return (0, _immutable.fromJS)(state);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production' && debug) console.log('redux-persist/getStoredState: Error restoring data ' + serialized, err);
        throw err;
      }
    }
  });
}