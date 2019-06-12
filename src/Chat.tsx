import React, {
  useRef,
  useState,
  useEffect,
  FormEventHandler,
} from 'react';

import hypercore from 'hypercore';
import crypto from 'hypercore-crypto';
//import ram from 'random-access-memory';
import rai from 'random-access-idb';
import DiscoverySwarmWeb from 'discovery-swarm-web';
import Discovery from 'hyperdiscovery';
// import swarm from 'webrtc-swarm';
// import signalhub from 'signalhub';
// import pump from 'pump';

import { Buffer } from 'buffer';
const key = Buffer.from(
  'fcc6212465b39a9a704d564f08da0402af210888e730f419a7faf5f347a33b3d'
);
const secretKey = Buffer.from(
  '1234567890abcdef1234567890abcdef1234567890abcdef1234567890fedcba'
);
const discoveryKey = crypto.discoveryKey(key);
console.log('crypto discoveryKey', discoveryKey.toString('hex'));

const todos = rai('todos');
const storage = (filename: any) => todos(filename);
//const feed = new hypercore(storage, { valueEncoding: 'utf-8' });
const feed = hypercore(storage, discoveryKey, {
  secretKey,
  valueEncoding: 'utf-8',
});
feed.on('error', (err: any) => console.log(err));

const replicationStream = feed.replicate({ encrypt: false, live: true });

 // feed.append('hello world');

// DiscoverySwarmWeb attempt: connects but no replication among peers
// const swarm = DiscoverySwarmWeb({
//   stream: () => feed.replicate({
//     live: true,
//     download: true,
//     upload: true,
//   }),
// });
// swarm.on('connection', (peer: any, type: any) => {
//   console.log('connection!', peer, type);
//   peer.pipe(replicationStream).pipe(peer);
// });
// swarm.join(feed.discoveryKey);

const discovery = Discovery(feed);
discovery.on('connection', (peer: any, type: any) => {;
  console.log('got', peer, type);
  peer.pipe(replicationStream).pipe(peer);
  //console.log('connected to', discovery.connections, 'peers');
  peer.on('close', function () {
    console.log('peer disconnected')
  });
});

// feed.on('ready', () => {
//   console.log('ready', feed.key.toString('hex'));
//   console.log('discovery', feed.discoveryKey.toString('hex'));

//   // const hub = signalhub(Buffer.from(discoveryKey), [
//   //   'https://signalhub-jccqtwhdwc.now.sh/',
//   // ]);

//   const hub = signalhub(discoveryKey.toString('hex'), [
//     'https://signalhub-jccqtwhdwc.now.sh/',
//   ]);

//   const sw = swarm(hub);
//   sw.on('peer', (peer: any, id: any) => {
//     console.log('peer', id, peer);
//     const replicationStream = feed.replicate({ encrypt: false, live: true });
//     peer.pipe(replicationStream).pipe(peer);
//   });

//   //   // feed.get(0, (err: any, d: any) => console.log(d.toString()));
// });

const stream = feed.createReadStream({ live: true });

const addToFeed = (t: string) => {
  feed.append(t);
  console.log('stats', feed.stats);
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
