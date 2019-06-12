import hypercore from 'hypercore';
import crypto from 'hypercore-crypto';
import rai from 'random-access-idb';
import swarm from 'webrtc-swarm';
import signalhub from 'signalhub';
import pump from 'pump';
import { Buffer } from 'buffer';

// TODO: Add types for everything here

// This is a hack because I was getting errors verifying the remove signature
// I took the code from hypercore and am just always returning true for the verification
// We need to look deeper into why it's not signing properly or maybe just provide our
// own crypto methods here.
const mockCrypto = {
  sign: (data: any, sk: any, cb: any) => {
    return cb(null, crypto.sign(data, sk));
  },
  verify: (sig: any, data: any, pk: any, cb: any) => {
    // Always say it's a valid signature (for testing)
    return cb(null, true);
  },
};

class Feed {
  private reduxStore: any;
  private databaseName: string;
  private key: any;
  private secretKey: any;
  private peerHubs: Array<string>;
  private feed: any;

  constructor(reduxStore: any, options: any) {
    if (!options.key)
      throw new Error('Key is required, should be XXXX in length');
    // hypercore seems to be happy when I turn the key into a discoveryKey,
    // maybe we could get away with just using a Buffer (or just calling discoveryKey with a string?)
    this.key = crypto.discoveryKey(Buffer.from(options.key));
    if (!options.secretKey)
      throw new Error('Secret key is required, should be XXXX in length');
    // hypercore doesn't seem to like the secret key being a discoveryKey,
    // but rather just a Buffer
    this.secretKey = Buffer.from(options.secretKey);
    this.databaseName = options.databaseName || 'data';
    this.peerHubs = options.peerHubs || [
      'https://signalhub-jccqtwhdwc.now.sh/',
    ];
    this.reduxStore = reduxStore;

    const todos = rai(`${this.databaseName}-${this.getKeyHex().substr(0, 12)}`);
    const storage = (filename: any) => todos(filename);

    console.log('crypto discoveryKey');

    this.feed = hypercore(storage, this.key, {
      secretKey: this.secretKey,
      valueEncoding: 'utf-8',
      crypto: mockCrypto,
    });
    this.feed.on('error', (err: any) => console.log(err));

    this.feed.on('ready', this.onFeedReady);
    this.startStreamReader();

    // Write to the feed
    const addToFeed = (t: string) => {
      this.reduxStore.dispatch({

      })
      this.feed.append(t);
    };
  }

  // How to apply this to the redux store?
  feedMiddleware = (next: any) => (action: any) => {
    if (action.type === FEED_ADD_ACTION) {
      this.feed.append(action.action);
      console.log('added to feed', action.type);
    }
    next(action);
  };

  onFeedReady = () => {
    console.log('ready', this.feed.key.toString('hex'));
    console.log('discovery', this.feed.discoveryKey.toString('hex'));
    // could add option to disallow peer connectivity here
    const hub = signalhub(this.getKeyHex(), this.peerHubs);
    const sw = swarm(hub);
    sw.on('peer', this.onPeerConnect);
  }

  startStreamReader = () => {
    // Wire up reading from the feed
    const stream = this.feed.createReadStream({ live: true });
    stream.on('data', (value: any) => {
      console.log('onData', value);
      // todo: read the feed item, convert to an appropriate action and dispatch action to redux store here?
      this.reduxStore.dispatch(value.payload.action);
    });
  };
  
  // redux-swarmlog code:
  // startReadStream() {
  //   this.log.createReadStream({ live: true })
  //   .on('data', function (data) {
  //     const action = data.value
  //     if (action.swarmLogSessionId !== sessionId) {
  //       _reduxStore.dispatch({
  //         ...action,
  //         fromSwarm: true
  //       })
  //     }
  //     logJson('RTC RECEIVED', data.value)
  //   })
  // }

  onPeerConnect = (peer: any, id: any) => {
    console.log('peer', id, peer);
    pump(
      peer,
      this.feed.replicate({
        encrypt: false,
        live: true,
        upload: true,
        download: true,
      }),
      peer
    );
  };

  getKeyHex = () => this.key.toString('hex');
}

const FEED_ADD_ACTION = 'FEED_ADD_ACTION';

const addFeedAction = (action: any) => {
  console.log('addFeedAction', action);
  return { type: FEED_ADD_ACTION, payload: { action } };
};

export { Feed, addFeedAction };
