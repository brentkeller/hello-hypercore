import { createStore } from 'redux';
import chatReducer from './chatReducer';

export function configureStore(preloadedState: any) {
  const store = createStore(chatReducer, preloadedState);
  return store
}
