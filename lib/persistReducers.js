'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = persistReducer;

var _reduxPersist = require('redux-persist');

var _immutable = require('immutable');

var _purgeStoredState = require('redux-persist/lib/purgeStoredState');

var _purgeStoredState2 = _interopRequireDefault(_purgeStoredState);

var _autoMergeLevel = require('./stateReconciler/autoMergeLevel1');

var _autoMergeLevel2 = _interopRequireDefault(_autoMergeLevel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultGetStoredState = _reduxPersist.getStoredState;

var DEFAULT_TIMEOUT = 5000;
/*
  @TODO add validation / handling for:
  - persisting a reducer which has nested _persist
  - handling actions that fire before reydrate is called
*/

function persistReducer(config, baseReducer) {
    if (process.env.NODE_ENV !== 'production') {
        if (!config) throw new Error('config is required for persistReducer');
        if (!config.key) throw new Error('key is required in persistor config');
        if (!config.storage) throw new Error("redux-persist: config.storage is required. Try using one of the provided storage engines `import storage from 'redux-persist/lib/storage'`");
    }

    var version = config.version || _reduxPersist.DEFAULT_VERSION;
    var debug = config.debug || false;
    var stateReconciler = config.stateReconciler || _autoMergeLevel2.default;
    var getStoredState = config.getStoredState || defaultGetStoredState;
    var timeout = config.timeout || DEFAULT_TIMEOUT;

    var _persistoid = null;
    var _purge = false;
    var _paused = true;

    var conditionalUpdate = function conditionalUpdate(state) {
        // update the persistoid only if we are rehydrated and not paused
        state.has('_persist') && state.get('_persist').get('rehydrated') && _persistoid && !_paused && _persistoid.update(state.toJS());

        return state;
    };

    return function (state, action) {
        var _persist = state && state.has('_persist') && state.get('_persist').size && state.get('_persist') || null;
        var restState = state && state.delete('_persist');

        if (action.type === _reduxPersist.PERSIST) {
            var _sealed = false;
            var _rehydrate = function _rehydrate(payload, err) {
                // dev warning if we are already sealed
                if (process.env.NODE_ENV !== 'production' && _sealed) console.error('redux-persist: rehydrate for "' + config.key + '" called after timeout.', payload, err);

                // only rehydrate if we are not already sealed
                if (!_sealed) {
                    action.rehydrate(config.key, payload, err);
                    _sealed = true;
                }
            };
            timeout && setTimeout(function () {
                !_sealed && _rehydrate(undefined, new Error('redux-persist: persist timed out for persist key "' + config.key + '"'));
            }, timeout);

            // @NOTE PERSIST resumes if paused.
            _paused = false;

            // @NOTE only ever create persistoid once, ensure we call it at least once, even if _persist has already been set
            if (!_persistoid) {
                _persistoid = (0, _reduxPersist.createPersistoid)(config);
            }
            // @NOTE PERSIST can be called multiple times, noop after the first
            if (_persist) return state;

            if (typeof action.rehydrate !== 'function' || typeof action.register !== 'function') {
                throw new Error('redux-persist: either rehydrate or register is not a function on the PERSIST action. This can happen if the action is being replayed. This is an unexplored use case, please open an issue and we will figure out a resolution.');
            }

            action.register(config.key);

            getStoredState(config).then(function (restoredState) {
                var migrate = config.migrate || function (s, v) {
                    return Promise.resolve(s);
                };
                migrate(restoredState, version).then(function (migratedState) {
                    return _rehydrate(migratedState);
                }, function (migrateErr) {
                    if (process.env.NODE_ENV !== 'production' && migrateErr) console.error('redux-persist: migration error', migrateErr);
                    _rehydrate(undefined, migrateErr);
                });
            }, function (err) {
                _rehydrate(undefined, err);
            });

            return baseReducer(restState, action).set('_persist', (0, _immutable.Map)({ version: version, rehydrated: false }));
        } else if (action.type === _reduxPersist.PURGE) {
            _purge = true;
            action.result((0, _purgeStoredState2.default)(config));
            return baseReducer(restState, action).set('_persist', _persist);
        } else if (action.type === _reduxPersist.FLUSH) {
            action.result(_persistoid && _persistoid.flush());
            return baseReducer(restState, action).set('_persist', _persist);
        } else if (action.type === _reduxPersist.PAUSE) {
            _paused = true;
        } else if (action.type === _reduxPersist.REHYDRATE) {
            if (_purge) {
                return baseReducer(restState, action).set('_persist', _persist.set({ 'rehydrated': true }));
            }

            // @NOTE if key does not match, will continue to default else below
            if (action.key === config.key) {

                var reducedState = baseReducer(restState, action);
                var inboundState = action.payload;
                // only reconcile state if stateReconciler and inboundState are both defined
                var reconciledRest = stateReconciler !== false && inboundState !== undefined ? stateReconciler(reducedState, inboundState) : reducedState;
                reconciledRest = reconciledRest.set('_persist', _persist && _persist.set('rehydrated', true) || (0, _immutable.Map)({ version: version, rehydrated: true }));
                var _newState = baseReducer(reconciledRest, action);
                return conditionalUpdate(_newState);
            }
        }

        // if we have not already handled PERSIST, straight passthrough
        if (!_persist) {
            return baseReducer(state, action);
        }

        // run base reducer:
        // is state modified ? return original : return updated
        var newState = baseReducer(restState, action);
        if (newState.equals(restState)) {
            return state;
        } else {
            newState = newState.set('_persist', _persist);
            return conditionalUpdate(newState);
        }
    };
}