# Redux Persist Immutable
A wrapper around redux-persist that provides  [ImmutableJS](https://facebook.github.io/immutable-js/) support.

# Usage
For entire api see [redux-persist docs](https://github.com/rt2zz/redux-persist). This library is a drop in replacement.
```js
import { persistStore, autoRehydrate } from 'redux-persist-immutable'

persistStore(store)
```

# Immutable records
```js
persistStore(state, { records: [SomeRecord] })
```
