# redux-persist-immutable-state
Implements stateIterator, stateGetter, stateSetter and stateReconciler for an [ImmutableJS](https://facebook.github.io/immutable-js/) root state.

# Dependencies
- [redux-persist](https://www.npmjs.com/package/redux-persist)
- [redux-persist-immutable](https://www.npmjs.com/package/redux-persist-immutable) -> If you're substate are ImmutableJS objects

# Usage

```
import { persistStore } from 'redux-persist';
import { stateIterator, stateGetter, stateSetter, 
         stateReconciler, lastStateInit } from 'redux-persist-immutable-state';

persistStore(state, {
  transforms: [reduxPersistImmutable], 
  stateIterator: stateIterator,  
  stateGetter: stateGetter, stateSetter: stateSetter,
  lastStateInit: lastStateInit
});
```
