import { createStore, applyMiddleware } from 'redux';
import dynamicMiddlewares from 'redux-dynamic-middlewares';
import chatReducer from './chatReducer';

export function configureStore(preloadedState: any) {
  const store = createStore(
    chatReducer,
    preloadedState,
    applyMiddleware(dynamicMiddlewares)
  );
  return store;
}
