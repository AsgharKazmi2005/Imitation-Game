// Imports :P
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMessages, setMessages } from '../utils/storage'
import getRandomUsername from '../utils/getRandomUsername'
import '../App.css'

// Function for the component that allows the human to respond to user messages
function HumanPage() {
  const [messages, setMessagesState] = useState(getMessages())
  const [input, setInput] = useState('')
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)

  // Listen for storage changes
  useEffect(() => {
    const onStorage = () => setMessagesState(getMessages())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const lastUserMsg = messages.filter(m => m.from === 'user').slice(-1)[0]
  const lastHumanMsg = messages.filter(m => m.from === 'human').slice(-1)[0]
  const canRespond = lastUserMsg && (!lastHumanMsg || messages.lastIndexOf(lastUserMsg) > messages.lastIndexOf(lastHumanMsg))

  // Assign random usernames for human and AI, store in localStorage
  const [humanUsername] = useState(() => {
    let u = localStorage.getItem('imitation-human-username')
    if (!u) {
      u = getRandomUsername()
      localStorage.setItem('imitation-human-username', u)
    }
    return u
  })
  const [aiUsername] = useState(() => {
    let u = localStorage.getItem('imitation-ai-username')
    if (!u) {
      u = getRandomUsername()
      localStorage.setItem('imitation-ai-username', u)
    }
    return u
  })

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || !canRespond) return
    const newMsgs = [...messages, { text: input, from: 'human', username: humanUsername }]
    setMessages(newMsgs)
    setMessagesState(newMsgs)
    setInput('')
  }

  const handleReset = () => {
    setMessages([])
    setMessagesState([])
    setInput('')
    localStorage.removeItem('imitation-messages')
  }

  return (
    <div className="app-container">
      <h1 className="title">Human Response</h1>
      <div className="chat-container">
        <div className="messages">
          {messages
            .filter(msg => msg.from !== 'ai')
            .map((msg, idx) => (
              <div key={idx} className={`message ${msg.from === 'user' ? 'user' : 'human'}`}>
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
            placeholder={canRespond ? "You are the human! Respond to the message like an AI..." : "Waiting for player..."}
            disabled={!canRespond}
            autoFocus
          />
          <button type="submit" className="send-btn" disabled={!canRespond}>Send</button>
        </form>
        <button className="nav-btn" onClick={() => navigate('/')}>Back to Main</button>
      </div>
    </div>
  )
}

export default HumanPage