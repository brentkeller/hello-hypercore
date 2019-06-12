import React, { useRef, FormEventHandler } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addChatMessage } from './store/chatReducer';

export const Chat = () => {
  const dispatch = useDispatch();
  const messages = useSelector<string[], string[]>(state => state);
  console.log('messages', messages);

  const input = useRef<HTMLInputElement>() as React.RefObject<HTMLInputElement>;
  const save: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    if (input && input.current) {
      const newText = input.current.value.trim();
      if (newText.length === 0) return;
      dispatch(addChatMessage(newText));
      //addToFeed(newText);
      input.current.value = '';
    }
  };

  return (
    <div>
      <form onSubmit={save}>
        <input type="text" id="message" name="message" ref={input} />
      </form>
      {messages.map((d, i) => (
        <div key={i}>{d}</div>
      ))}
    </div>
  );
};
