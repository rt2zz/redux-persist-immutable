# Redux Persist Immutable
A wrapper around redux-persist that provides  [ImmutableJS](https://facebook.github.io/immutable-js/) support.

# Usage
For entire api see [redux-persist docs](https://github.com/rt2zz/redux-persist). This library is a drop in replacement.
```js
import { persistReducer, persistCombineReducers } from 'redux-persist-immutable'
```

# Immutable records
```js
const persistConfig = {
  key: 'root',
  transforms: [encryptor],
  storage
};

const someLonleyPersistedReducer = persistReducer(persistConfig, e);

const root = persistCombineReducers(persistConfig, {
  a,
  b,
  c,
  d
});
```
