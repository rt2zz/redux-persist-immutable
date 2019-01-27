'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getStoredState;

var _reduxPersist = require('redux-persist');

var _remotedevSerialize = require('remotedev-serialize');

var _remotedevSerialize2 = _interopRequireDefault(_remotedevSerialize);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var defaultDeserialize = _remotedevSerialize2.default.immutable(_immutable2.default).parse;

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
        var rawState = deserialize(serialized);

        var _rawState$keys = rawState.keys(),
            _rawState$keys2 = _toArray(_rawState$keys),
            rawStateKeys = _rawState$keys2.slice(0);

        rawStateKeys.forEach(function (key) {
          state = state.set(key, transforms.reduceRight(function (subState, transformer) {
            return transformer.out(subState, key, rawState);
          }, deserialize(rawState.get(key))));
        });
        return state;
      } catch (err) {
        if (process.env.NODE_ENV !== 'production' && debug) console.log('redux-persist/getStoredState: Error restoring data ' + serialized, err);
        throw err;
      }
    }
  });
}