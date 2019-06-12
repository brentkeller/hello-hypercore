const CHAT_ADD_MESSAGE = 'CHAT_ADD_MESSAGE';

const reducer = (state: any = [], action: any) => {
  switch (action.type) {
    case CHAT_ADD_MESSAGE: {
      return [ ...state, action.payload.message ];
    }

    default:
      return state;
  }
};

export default reducer;
