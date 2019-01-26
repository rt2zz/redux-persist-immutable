import { KEY_PREFIX, REHYDRATE } from 'redux-persist'
import Serialize from 'remotedev-serialize';
import immutableTransform from 'redux-persist-transform-immutable';
import Immutable, { Map } from 'immutable';

const defaultSerialize = Serialize.immutable(Immutable).stringify

export default function createPersistoid(config) {
  // defaults
  const blacklist = config.blacklist || null;
  const whitelist = config.whitelist || null;
  const transforms = config.transforms || [immutableTransform()];
  const throttle = config.throttle || 0;
  const storageKey = `${
    config.keyPrefix !== undefined ? config.keyPrefix : KEY_PREFIX
  }${config.key}`;
  const storage = config.storage;
  const serialize = defaultSerialize;
  const writeFailHandler = config.writeFailHandler || null;

  // initialize stateful values
  let lastState = Map();
  let stagedState = Map();
  let keysToProcess = []
  let timeIterator = null
  let writePromise = null

  const update = (state) => {
    // add any changed keys to the queue
    const [ ...keys ] = state.keys();
    keys.forEach(key => {
      if (!passWhitelistBlacklist(key)) return // is keyspace ignored? noop
      if (lastState.has(key) === state.has(key)) return // value unchanged? noop
      if (keysToProcess.indexOf(key) !== -1) return // is key already queued? noop
      keysToProcess.push(key) // add key to queue
    })

    //if any key is missing in the new state which was present in the lastState,
    //add it for processing too
    const [ ...lastStateKeys ] = state.keys();
    lastStateKeys.forEach(key => {
      if (
        state.has(key) === undefined &&
        passWhitelistBlacklist(key) &&
        keysToProcess.indexOf(key) === -1
      ) {
        keysToProcess.push(key)
      }
    })

    // start the time iterator if not running (read: throttle)
    if (timeIterator === null) {
      timeIterator = setInterval(processNextKey, throttle)
    }

    lastState = state
  }

  function processNextKey() {
    if (keysToProcess.length === 0) {
      if (timeIterator) clearInterval(timeIterator)
      timeIterator = null
      return
    }

    let key = keysToProcess.shift()
    let endState = transforms.reduce((subState, transformer) => {
      return transformer.in(subState, key, lastState)
    }, lastState[key])

    if (endState !== undefined) {
      try {
        stagedState = stagedState.set(key, serialize(endState));
      } catch (err) {
        console.error(
          'redux-persist/createPersistoid: error serializing state',
          err
        )
      }
    } else {
      //if the endState is undefined, no need to persist the existing serialized content
      stagedState = stagedState.delete(key)
    }

    if (keysToProcess.length === 0) {
      writeStagedState()
    }
  }

  function writeStagedState() {
    // cleanup any removed keys just before write.
    const [ ...keys ] = stagedState.keys();
    keys.forEach(key => {
      if (lastState.has(key) === undefined) {
        stagedState = stagedState.delete(key);
      }
    })
    writePromise = storage
      .setItem(storageKey, serialize(stagedState))
      .catch(onWriteFail)
  }

  function passWhitelistBlacklist(key) {
    if (whitelist && whitelist.indexOf(key) === -1 && key !== '_persist')
      return false
    if (blacklist && blacklist.indexOf(key) !== -1) return false
    return true
  }

  function onWriteFail(err) {
    // @TODO add fail handlers (typically storage full)
    if (writeFailHandler) writeFailHandler(err)
    if (err && process.env.NODE_ENV !== 'production') {
      console.error('Error storing data', err)
    }
  }

  const flush = () => {
    while (keysToProcess.length !== 0) {
      processNextKey()
    }
    return writePromise || Promise.resolve()
  }

  // return `persistoid`
  return {
    update,
    flush,
  }
}