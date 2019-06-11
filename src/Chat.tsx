import React, { useRef, useState, useEffect, FormEventHandler } from 'react';

import hypercore from 'hypercore';
//import ram from 'random-access-memory';
import rai from 'random-access-idb';
import { Buffer } from 'buffer';

const key = Buffer.from(
  '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
);
const secretKey = Buffer.from(
  '1234567890abcdef1234567890abcdef1234567890abcdef1234567890fedcba'
);

const todos = rai('todos');

const storage = (filename: any) => todos(filename);

const feed = new hypercore(storage, { valueEncoding: 'utf-8' });
// const feed = new hypercore(storage, key, { secretKey });

// feed.append('hello world');
const feedItems: string[] = [];

// feed.on('ready', () => {
//   console.log('ready', feed.key.toString('hex'));

//   // feed.get(0, (err: any, d: any) => console.log(d.toString()));
//   // feed.get(1, (err: any, d: any) => console.log(d.toString()));

//   // feed.append('hello again');
// });

const stream = feed.createReadStream({ live: true });

const addToFeed = (t: string) => {
  feed.append(t);
};

export const Chat = () => {
  const [items, setItems] = useState<string[]>([]);

  const readItem = (value: string) => {
    console.log('onData', value, items);
    setItems(prevState => [...prevState, value]);
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
      addToFeed(newText);
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
