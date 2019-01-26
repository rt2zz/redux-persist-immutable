import { KEY_PREFIX } from 'redux-persist'
import Serialize from 'remotedev-serialize';
import Immutable, { Map } from 'immutable';

const defaultDeserialize = Serialize.immutable(Immutable).parse;

export default function getStoredState(config) {
  const transforms = config.transforms || []
  const storageKey = `${
    config.keyPrefix !== undefined ? config.keyPrefix : KEY_PREFIX
  }${config.key}`
  const storage = config.storage
  const debug = config.debug
  const deserialize = config.serialize === false ? x => x : defaultDeserialize
  return storage.getItem(storageKey).then(serialized => {
    if (!serialized) return undefined
    else {
      try {
        let state = Map();
        let rawState = deserialize(serialized);
        const [ ...rawStateKeys ] = rawState.keys();
        rawStateKeys.forEach(key => {
          state = state.set(key, transforms.reduceRight((subState, transformer) => {
            return transformer.out(subState, key, rawState)
          }, deserialize(rawState.get(key))));
        });
        return state
      } catch (err) {
        if (process.env.NODE_ENV !== 'production' && debug)
          console.log(
            `redux-persist/getStoredState: Error restoring data ${serialized}`,
            err
          )
        throw err
      }
    }
  })
}