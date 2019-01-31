'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createPersistoid;

var _reduxPersist = require('redux-persist');

var _remotedevSerialize = require('remotedev-serialize');

var _remotedevSerialize2 = _interopRequireDefault(_remotedevSerialize);

var _reduxPersistTransformImmutable = require('redux-persist-transform-immutable');

var _reduxPersistTransformImmutable2 = _interopRequireDefault(_reduxPersistTransformImmutable);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var defaultSerialize = _remotedevSerialize2.default.immutable(_immutable2.default).stringify;

function createPersistoid(config) {
  // defaults
  var blacklist = config.blacklist || null;
  var whitelist = config.whitelist || null;
  var transforms = config.transforms || [(0, _reduxPersistTransformImmutable2.default)()];
  var throttle = config.throttle || 0;
  var storageKey = '' + (config.keyPrefix !== undefined ? config.keyPrefix : _reduxPersist.KEY_PREFIX) + config.key;
  var storage = config.storage;
  var serialize = defaultSerialize;
  var writeFailHandler = config.writeFailHandler || null;

  // initialize stateful values
  var lastState = (0, _immutable.Map)();
  var stagedState = (0, _immutable.Map)();
  var keysToProcess = [];
  var timeIterator = null;
  var writePromise = null;

  var update = function update(state) {
    console.log('update', state, timeIterator, keysToProcess);
    // add any changed keys to the queue

    var _state$keys = state.keys(),
        _state$keys2 = _toArray(_state$keys),
        keys = _state$keys2.slice(0);

    keys.forEach(function (key) {
      if (!passWhitelistBlacklist(key)) return; // is keyspace ignored? noop
      if (lastState.has(key) === state.has(key)) return; // value unchanged? noop
      if (keysToProcess.includes(key)) return; // is key already queued? noop
      keysToProcess.push(key); // add key to queue
    });

    //if any key is missing in the new state which was present in the lastState,
    //add it for processing too

    var _state$keys3 = state.keys(),
        _state$keys4 = _toArray(_state$keys3),
        lastStateKeys = _state$keys4.slice(0);

    lastStateKeys.forEach(function (key) {
      if (passWhitelistBlacklist(key) && !keysToProcess.includes(key)) {
        keysToProcess.push(key);
      }
    });

    // start the time iterator if not running (read: throttle)
    if (timeIterator === null) {
      timeIterator = setInterval(processNextKey, throttle);
    }

    lastState = state;
  };

  function processNextKey() {
    if (keysToProcess.length === 0) {
      if (timeIterator) clearInterval(timeIterator);
      timeIterator = null;
      return;
    }

    var key = keysToProcess.shift();
    console.log('processNextKey', lastState, key);
    var endState = transforms.reduce(function (subState, transformer) {
      return transformer.in(subState, key, lastState);
    }, lastState.get(key));

    if (endState !== undefined) {
      try {
        stagedState = stagedState.set(key, serialize(endState));
      } catch (err) {
        console.error('redux-persist/createPersistoid: error serializing state', err);
      }
    } else {
      //if the endState is undefined, no need to persist the existing serialized content
      stagedState = stagedState.delete(key);
    }

    if (keysToProcess.length === 0) {
      writeStagedState();
    }
  }

  function writeStagedState() {
    // cleanup any removed keys just before write.
    var _stagedState$keys = stagedState.keys(),
        _stagedState$keys2 = _toArray(_stagedState$keys),
        keys = _stagedState$keys2.slice(0);

    keys.forEach(function (key) {
      if (lastState.has(key) === undefined) {
        stagedState = stagedState.delete(key);
      }
    });
    writePromise = storage.setItem(storageKey, serialize(stagedState)).catch(onWriteFail);
  }

  function passWhitelistBlacklist(key) {
    if (whitelist && whitelist.includes(key) && key !== '_persist') {
      return false;
    }
    if (blacklist && blacklist.includes(key)) {
      return false;
    }
    return true;
  }

  function onWriteFail(err) {
    // @TODO add fail handlers (typically storage full)
    if (writeFailHandler) writeFailHandler(err);
    if (err && process.env.NODE_ENV !== 'production') {
      console.error('Error storing data', err);
    }
  }

  var flush = function flush() {
    while (keysToProcess.length !== 0) {
      processNextKey();
    }
    return writePromise || Promise.resolve();
  };

  // return `persistoid`
  return {
    update: update,
    flush: flush
  };
}