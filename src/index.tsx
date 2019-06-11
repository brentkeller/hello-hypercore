import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import hypercore from 'hypercore';
import ram from 'random-access-memory';
import rai from 'random-access-idb';

const todos = rai('todos');

const storage = (filename: any) => todos(filename);

const feed = new hypercore(storage);


// feed.append('hello world');

feed.on('ready', () => {
  console.log('ready');
  // feed.get(0, (err: any, d: any) => console.log(d.toString()));
  // feed.get(1, (err: any, d: any) => console.log(d.toString()));

  feed.createReadStream({ live: true}).on('data', (d: any) => {
    console.log('onData', d.toString());
  });

  // feed.append('hello again');

});



ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
