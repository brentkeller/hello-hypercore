import React, { useRef, useState, useEffect, FormEventHandler } from 'react';

import hyperdb from 'hyperdb';
import crypto from 'hypercore-crypto';
//import ram from 'random-access-memory';
import rai from 'random-access-idb';

import swarm from 'webrtc-swarm';
import signalhub from 'signalhub';

import { Buffer } from 'buffer';
const key = Buffer.from(
  'fcc6212465b39a9a704d564f08da0402af210888e730f419a7faf5f347a33b3d'
);
const secretKey = Buffer.from(
  '1234567890abcdef1234567890abcdef1234567890abcdef1234567890fedcba'
);

// const discoveryKey =
//   'c65c11064005ef183421c45014e9831392069731239b2767ff6381152ac00379';

const discoveryKey = crypto.discoveryKey(key);

const todos = rai('todos');

console.log('crypto discoveryKey', discoveryKey.toString('hex'));

const storage = (filename: any) => todos(filename);

//const db = new hypercore(storage, { valueEncoding: 'utf-8' });
const db = hyperdb(storage, discoveryKey, { valueEncoding: 'utf-8' });

db.on('error', (err: any) => console.log(err));

db.on('ready', () => {
  console.log('ready', db.key.toString('hex'));
  console.log('discovery', db.discoveryKey.toString('hex'));

  // const hub = signalhub(Buffer.from(discoveryKey), [
  //   'https://signalhub-jccqtwhdwc.now.sh/',
  // ]);

  const hub = signalhub(discoveryKey.toString('hex'), [
    'https://signalhub-jccqtwhdwc.now.sh/',
  ]);

  const sw = swarm(hub);
  sw.on('peer', (peer: any, id: any) => {
    console.log('peer', id, peer);
    const replicationStream = db.replicate({ encrypt: false, live: true });
    peer.pipe(replicationStream).pipe(peer);
  });

  //   // db.get(0, (err: any, d: any) => console.log(d.toString()));
});

const stream = db.createReadStream({ live: true });

const addTodb = (t: string) => {
  const newKey = crypto.randomBytes(12).toString();
  db.put(newKey, t, (err: any) => {
    if (err) throw err;
    db.get(newKey, function(err: any, nodes: any) {
      if (err) throw err;
      console.log(`${newKey} --> `, nodes[0].value);
    });
  });
};

export const Chat = () => {
  const [items, setItems] = useState<string[]>([]);

  const readItem = (value: any) => {
    const text = value[0].value;
    console.log('onData', text, value );
    setItems(prevState => [...prevState, text]);
  };

  useEffect(() => {
    stream.on('data', readItem);
  }, []);
  
  const input = useRef<HTMLInputElement>() as React.RefObject<HTMLInputElement>;
  const save: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    if (input && input.current) {
      const newText = input.current.value.trim();
      if (newText.length === 0) return;
      addTodb(newText);
      input.current.value = '';
    }
  };

  return (
    <div>
      <form onSubmit={save}>
        <input type="text" id="message" name="message" ref={input} />
      </form>
      {items.map((d, i) => (
        <div key={i}>{d}</div>
      ))}
    </div>
  );
};
