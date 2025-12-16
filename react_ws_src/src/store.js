// Custom message store implementation using EventEmitter to manage the state
// of chat messages in React 15.x without introducing any new libraries.
// This can be modified to be a more general store easiliy enough but currently it 
// is chat message specific.

import { EventEmitter } from 'events';

const emitter = new EventEmitter();
const CHANGE_EVENT = 'change';
const defaultState = {
  chatMessages: [{
      text: 'Waiting for opponent...',
      date: null,
      from: 'System',
      from_uuid: 'system',
  }],
};

let state = Object.assign({}, defaultState);
  
module.exports = {
  getState: function () {
    return state;
  },
 
  // Reset the store to its default state and emit a change event
  reset: function () {
    state = Object.assign({}, defaultState);
    emitter.emit(CHANGE_EVENT);
  },
 
  // Get the current list of chat messages
  // @return {Array: {msg: string, date: number, from: string, from_uuid: string, is_mine: bool}}
  getChatMessages: function () {
    return state.chatMessages;
  },
  
  // Add a new message to the chat and emit a change event
  // @param data {{msg: string, date: number, from: string, from_uuid: string, is_mine: bool}}
  // @returns {void}
  addChatMessage: function (data) {
    state = Object.assign({}, state, {
      chatMessages: state.chatMessages.concat([data])
    });
    emitter.emit(CHANGE_EVENT);
  },

  // Subscribe to state changes
  // @param onChange {function}
  // @returns {function} Unsubscribe function
  subscribe: function (onChange) {
    emitter.on(CHANGE_EVENT, onChange);
    return function unsubscribe() {
      emitter.removeListener(CHANGE_EVENT, onChange);
    };
  }
};
