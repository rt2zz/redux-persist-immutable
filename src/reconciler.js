import { Map } from 'immutable';

export function stateReconciler(state, inboundState, reducedState, logger) {
 let newState = reducedState ? reducedState : Map()

 Object.keys(inboundState).forEach((key) => {
   // if reducer modifies substate, skip auto rehydration
   if (state.get(key) !== reducedState.get(key)) {
     if (logger) console.log('redux-persist/autoRehydrate: sub state for key `%s` modified, skipping autoRehydrate.', key)
     newState = newState.set(key, reducedState.get(key))
     return
   }

   // otherwise take the inboundState
   if (state.has(key)) {
     newState = newState.mergeIn([key], inboundState[key]) // shallow merge
   } else {
     newState = newState.set(key, inboundState[key]) // hard set
   }

   if (logger) console.log('redux-persist/autoRehydrate: key `%s`, rehydrated to ', key, newState.get(key))
 })

 return newState
}
