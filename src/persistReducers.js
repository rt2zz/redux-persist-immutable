import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REHYDRATE,
  DEFAULT_VERSION,
} from 'redux-persist'
import { Map } from 'immutable';
import purgeStoredState from 'redux-persist/lib/purgeStoredState'
import createPersistoid from './createPersistoid'
import autoMergeLevel1 from './stateReconciler/autoMergeLevel1';
import defaultGetStoredState from './getStoredState'

const DEFAULT_TIMEOUT = 5000;
/*
  @TODO add validation / handling for:
  - persisting a reducer which has nested _persist
  - handling actions that fire before reydrate is called
*/

export default function persistReducer(config, baseReducer) {
  if (process.env.NODE_ENV !== 'production') {
    if (!config) throw new Error('config is required for persistReducer')
    if (!config.key) throw new Error('key is required in persistor config')
    if (!config.storage)
      throw new Error(
        "redux-persist: config.storage is required. Try using one of the provided storage engines `import storage from 'redux-persist/lib/storage'`"
      )
  }

  const version = config.version || DEFAULT_VERSION
  const debug = config.debug || false
  const stateReconciler = config.stateReconciler || autoMergeLevel1;
  const getStoredState = config.getStoredState || defaultGetStoredState;
  const timeout = config.timeout || DEFAULT_TIMEOUT;

  let _persistoid = null;
  let _purge = false;
  let _paused = true;

  const conditionalUpdate = state => {
    // update the persistoid only if we are rehydrated and not paused
    state.has('_persist') && state.get('_persist').get('rehydrated') &&
      _persistoid &&
      !_paused &&
      _persistoid.update(state)

    return state
  }

  return (state, action) => {
    let _persist = state && state.has('_persist') && state.get('_persist').size && state.get('_persist') || null;
    let restState = state && state.delete('_persist');

    const handlesMap = {
      [PERSIST]: function () {
        let _sealed = false
        let _rehydrate = (payload, err) => {
          // dev warning if we are already sealed
          if (process.env.NODE_ENV !== 'production' && _sealed)
            console.error(
              `redux-persist: rehydrate for "${
              config.key
              }" called after timeout.`,
              payload,
              err
            )

          // only rehydrate if we are not already sealed
          if (!_sealed) {
            action.rehydrate(config.key, payload, err)
            _sealed = true
          }
        }
        timeout &&
          setTimeout(() => {
            !_sealed &&
              _rehydrate(
                undefined,
                new Error(
                  `redux-persist: persist timed out for persist key "${
                  config.key
                  }"`
                )
              )
          }, timeout)

        // @NOTE PERSIST resumes if paused.
        _paused = false

        // @NOTE only ever create persistoid once, ensure we call it at least once, even if _persist has already been set
        if (!_persistoid) {
          _persistoid = createPersistoid(config);
        }
        // @NOTE PERSIST can be called multiple times, noop after the first
        if (_persist) return state

        if (
          typeof action.rehydrate !== 'function' ||
          typeof action.register !== 'function'
        ) {
          throw new Error(
            'redux-persist: either rehydrate or register is not a function on the PERSIST action. This can happen if the action is being replayed. This is an unexplored use case, please open an issue and we will figure out a resolution.'
          )
        }

        action.register(config.key)

        getStoredState(config).then(
          restoredState => {
            const migrate = config.migrate || ((s, v) => Promise.resolve(s))
            migrate(restoredState, version).then(
              migratedState => _rehydrate(migratedState),
              migrateErr => {
                if (process.env.NODE_ENV !== 'production' && migrateErr)
                  console.error('redux-persist: migration error', migrateErr)
                _rehydrate(undefined, migrateErr)
              }
            )
          },
          err => {
            _rehydrate(undefined, err)
          }
        );

        return baseReducer(restState, action).set('_persist', Map({ version, rehydrated: false }));
      },
      [PURGE]: function () {
        _purge = true
        action.result(purgeStoredState(config))
        return baseReducer(restState, action).set('_persist', _persist);
      },
      [FLUSH]: function () {
        action.result(_persistoid && _persistoid.flush())
        return baseReducer(restState, action).set('_persist', _persist);
      },
      [REHYDRATE]: function () {
        if (_purge) {
          return baseReducer(restState, action).set('_persist', _persist.set({ 'rehydrated': true }));
        }
        // @NOTE if key does not match, will continue to default else below
        if (action.key === config.key) {
          let reducedState = baseReducer(restState, action);
          let inboundState = action.payload
          // only reconcile state if stateReconciler and inboundState are both defined
          let reconciledRest =
            stateReconciler !== false && inboundState !== undefined
              ? stateReconciler(reducedState, inboundState)
              : reducedState;
          reconciledRest = reconciledRest.set('_persist', _persist && _persist.set('rehydrated', true) || Map({ version, rehydrated: true }));
          let newState = baseReducer(reconciledRest, action);
          return conditionalUpdate(newState)
        }
      }
    }

    if (handlesMap[action.type]) {
      return handlesMap[action.type]();
    }

    // if we have not already handled PERSIST, straight passthrough
    if (!_persist) {
      return baseReducer(state, action)
    }

    // run base reducer:
    // is state modified ? return original : return updated
    let newState = baseReducer(restState, action);
    if (newState.equals(restState)) {
      return state;
    } else {
      newState = newState.set('_persist', _persist);
      return conditionalUpdate(newState)
    }
  }
}