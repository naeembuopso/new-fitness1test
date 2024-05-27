import { Component, ChangeEvent } from 'react';
import api from '../api';

// Define state types
interface ChatState {
  message: string;
  chat: Array<{ type: 'sent' | 'received'; text: string }>;
  conversation_id: string;
  thread_id: string;
}

class Chat extends Component<{}, ChatState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      message: '',
      chat: [],
      conversation_id: '',
      thread_id: ''
    };
    this.handleSendMessage = this.handleSendMessage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.initializeConversation();
  }
  async initializeConversation() {
    const accessToken = localStorage.getItem('accessToken'); // Ensure you handle authentication

    try {
      const response = await api.get('/generate_conversation_id', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      // Assuming the API response contains these ids under these keys
      this.setState({
        conversation_id: response.data.conversation_id,
        thread_id: response.data.thread_id,
        chat: [...this.state.chat, { type: 'received', text: response.data.message }],
      });
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
    }
  }

  handleChange(e: ChangeEvent<HTMLInputElement>) {
    this.setState({ message: e.target.value });
  }

  async handleSendMessage() {
    const { message, chat, conversation_id, thread_id } = this.state;
    const accessToken = localStorage.getItem('accessToken'); // Get access token from local storage

    if (message.trim() === '') return;

    // Add the message to the chat
    this.setState({ chat: [...chat, { type: 'sent', text: message }] });

    try {
      // Send the GET request with the message and other necessary information
      const response = await api.post('/chat_response', { 
        message, conversation_id, thread_id 
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`  // Include the authoriztion header
        },
      });

      console.log(response.data)
      // Add the response to the chat
      this.setState({
        chat: [...this.state.chat, { type: 'received', text: response.data.reply }],
      });
    } catch (error) {
      console.error('Error sending message:', error);
      this.setState({
        chat: [...this.state.chat, { type: 'received', text: 'Error sending message' }],
      });
    }

    // Clear the input field
    this.setState({ message: '' });
  }

  render() {
    const { message, chat } = this.state;

    return (
      <div style={styles.container}>
        <div style={styles.Chat}>
          {chat.map((entry, index) => (
            <div
              key={index}
              style={entry.type === 'sent' ? styles.sentMessage : styles.receivedMessage}
            >
              {entry.text}
            </div>
          ))}
        </div>
        <div style={styles.inputContainer}>
          <input
            type="text"
            value={message}
            onChange={this.handleChange}
            style={styles.input}
            placeholder="Type your message..."
          />
          <button onClick={this.handleSendMessage} style={styles.button}>Send</button>
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
  },
  Chat: {
    width: '300px',
    height: '400px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    padding: '10px',
    overflowY: 'auto' as 'auto',
    marginBottom: '10px',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#e1ffc7',
    borderRadius: '10px',
    padding: '5px 10px',
    margin: '5px 0',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '5px 10px',
    margin: '5px 0',
  },
  inputContainer: {
    display: 'flex',
    width: '300px',
  },
  input: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px 0 0 5px',
  },
  button: {
    padding: '10px 15px',
    border: '1px solid #ccc',
    borderRadius: '0 5px 5px 0',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer',
  },
};

export default Chat;
