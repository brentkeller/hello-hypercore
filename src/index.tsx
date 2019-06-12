import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { configureStore } from './store/store';
import { Feed } from './feed';
import { Chat } from './Chat';

const store = configureStore([]);

const key = 'fcc6212465b39a9a704d564f08da0402af210888e730f419a7faf5f347a33b3d';
const secretKey = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890fedcba';

const feed = new Feed(store, {
  key,
  secretKey,
});

ReactDOM.render(<Provider store={store}><Chat /></Provider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
