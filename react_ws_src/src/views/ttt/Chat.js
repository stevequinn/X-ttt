// Chat Pure Component for displaying and sending messages

import React from 'react';
import PropTypes from 'prop-types';
import msgStore from '../../store';

class MessageRow extends React.PureComponent {
  // Using a PureComponent here to prevent unnecessary re-renders
  
  formattedDate(dateStr) {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  render() {
    const { msg } = this.props;
    const rowClassName = msg.is_mine ? 'message right' : 'message';

    return (
      <div className={rowClassName}>
        <div className='msg'>{msg.text}</div>
        {msg.date && <div className='date'>{this.formattedDate(msg.date)}</div>}
      </div>
    );
  }
}

MessageRow.propTypes = {
  msg: PropTypes.object.isRequired,
};

export default class Chat extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      messages: msgStore.getChatMessages()
    };
  }
  
  componentDidMount() {
    // Subscribe to the central message store and update message list state on changes. 
    this.unsubscribe = msgStore.subscribe(function () {
      this.setState({
        messages: msgStore.getChatMessages()
      });
    }.bind(this));
  }
  
  componentWillUnmount() {
    if (this.unsubscribe) {
      // Clear the message store on unmount.
      msgStore.reset();
      this.unsubscribe();
    }
  }
  
  componentDidUpdate() {
    // Scroll to the bottom when new messages are added
    const messageList = this.refs.message_list;
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  }

  render() {
    const { messages } = this.state;

    return (
      <div id='chat'>
        <div ref='message_list' className='message_list'>
          {messages &&
            messages.map(function (m) {
              return <MessageRow key={m.from_uuid + m.date} msg={m} />;
            })}
        </div>

        <form>
          <div ref='msgHolder' className='input_holder left'>
            <label>&nbsp;</label>
            <input
              ref='msg'
              type='text'
              className='input msg'
              placeholder='Your Message'
              required
            />
          </div>

          <button
            type='submit'
            onClick={this.sendMsg.bind(this)}
            className='button'
          >
            <span>
              SEND <span className='fa fa-caret-right'></span>
            </span>
          </button>
        </form>
      </div>
    );
  }

  sendMsg(e) {
    e.preventDefault();
    const msg = this.refs.msg.value.trim();
    if (!msg || !this.props.onSendMsg) return;

    this.props.onSendMsg(msg);
    this.refs.msg.value = '';
  }
}

Chat.propTypes = {
  onSendMsg: PropTypes.func.isRequired,
};
