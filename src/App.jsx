import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  const handleSend = (e) => {
    e.preventDefault()
    if (input.trim() === '') return
    setMessages([...messages, { text: input, from: 'user' }])
    setInput('')
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="app-container">
      <h1 className="title">The Imitation Game</h1>
      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.from}`}>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form className="input-form" onSubmit={handleSend}>
          <input
            className="chat-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            autoFocus
          />
          <button type="submit" className="send-btn">Send</button>
        </form>
      </div>
    </div>
  )
}

export default App
