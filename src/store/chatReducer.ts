import { addFeedAction } from '../feed';

// Constants
export const CHAT_ADD_MESSAGE = 'CHAT_ADD_MESSAGE';

// Action creators

export const addChatMessage = (message: string) => {
  console.log('addChatMessage', message);
  return addFeedAction({
    type: CHAT_ADD_MESSAGE,
    payload: { message },
  });
};

// Reducer
const reducer = (state: any = [], action: any) => {
  switch (action.type) {
    case CHAT_ADD_MESSAGE: {
      return [...state, action.payload.message];
    }

    default:
      return state;
  }
};

export default reducer;
