import { useState, useRef, useEffect } from 'react'
import { getMessages, setMessages } from '../utils/storage'
import getRandomUsername from '../utils/getRandomUsername'
import '../App.css'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});
console.log("OpenAI key:", import.meta.env.VITE_OPENAI_API_KEY);

function MainChat() {
  const [messages, setMessagesState] = useState(getMessages())
  const [input, setInput] = useState('')
  const [waiting, setWaiting] = useState(false)
  const [pendingResponses, setPendingResponses] = useState({ ai: null, human: null })
  const [guessResult, setGuessResult] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const messagesEndRef = useRef(null)

  // React to any storage changes
  useEffect(() => {
    const onStorage = () => setMessagesState(getMessages())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Scroll to bottom of chatbox on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Generate anonymous usernames for AI and Human
  const [anonUsernames, setAnonUsernames] = useState(() => {
    let stored = localStorage.getItem('imitation-anon-usernames')
    if (stored) return JSON.parse(stored)
    const anon1 = getRandomUsername()
    let anon2
    do {
      anon2 = getRandomUsername()
    } while (anon2 === anon1)
    const pair = [anon1, anon2]
    localStorage.setItem('imitation-anon-usernames', JSON.stringify(pair))
    return pair
  })

  // Reset the game, regenerate anon usernames
  const handleReset = () => {
    setMessages([])
    setMessagesState([])
    setInput('')
    setWaiting(false)
    setPendingResponses({ ai: null, human: null })
    setAnonUsernames(() => {
      const anon1 = getRandomUsername()
      let anon2
      do {
        anon2 = getRandomUsername()
      } while (anon2 === anon1)
      const pair = [anon1, anon2]
      localStorage.setItem('imitation-anon-usernames', JSON.stringify(pair))
      return pair
    })
    localStorage.removeItem('imitation-messages')
  }

  // Find the usernames
  const getLatestResponsePair = () => {
    // Find last user message index
    const lastUserIdx = messages.map(m => m.from).lastIndexOf('user')
    // Find all anon responses after last user message
    const responses = messages.slice(lastUserIdx + 1).filter(m => m.anon)
    if (responses.length < 2) return null
    // Return both anon usernames and which is human
    return {
      anons: [responses[0].anon, responses[1].anon],
      whichIsHuman: responses.find(r => r.from === 'human')?.anon,
    }
  }

  // Show guess option if at least one user message and at least one response pair exists
  const canGuess = messages.some(m => m.from === 'user') && getLatestResponsePair()

  // After user sends a message, wait for both responses
  useEffect(() => {
    if (!waiting) return

    const lastUserIdx = messages.map(m => m.from).lastIndexOf('user')
    const humanIdx = messages.findIndex((m, i) => m.from === 'human' && i > lastUserIdx)

    if (
      pendingResponses.ai !== null &&
      humanIdx !== -1 &&
      pendingResponses.human === null
    ) {
      const humanMsg = messages[humanIdx]
      setPendingResponses(prev => ({ ...prev, human: humanMsg.text }))
    }

    if (pendingResponses.ai !== null && pendingResponses.human !== null) {
      // Assign the same anonymous usernames for each response pair
      const responses = [
        { text: pendingResponses.ai, from: 'ai', anon: anonUsernames[0] },
        { text: pendingResponses.human, from: 'human', anon: anonUsernames[1] }
      ]
      // Shuffle order so that the user doesn't know which is which when repeatedly playing
      for (let i = responses.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[responses[i], responses[j]] = [responses[j], responses[i]]
      }
      const lastUserIdx = messages.map(m => m.from).lastIndexOf('user')
      const newMsgs = [...messages.slice(0, lastUserIdx + 1), ...responses]
      setMessages(newMsgs)
      setMessagesState(newMsgs)
      setWaiting(false)
      setPendingResponses({ ai: null, human: null })
    }
  }, [messages, waiting, pendingResponses, anonUsernames])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || waiting) return
  
    const newMsgs = [...messages, { text: input, from: 'user' }]
    setMessages(newMsgs)
    setMessagesState(newMsgs)
    setInput('')
    setWaiting(true)
    setPendingResponses({ ai: null, human: null })
  
    // Simulate AI response with a bit of a delay
    setTimeout(async () => {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content:"Skip any preamble and reply briefly while adhering to human-like response: this consists of generalizing your responses down without overly extending your answer. You don't have to answer by restating the question. For example: If prompted to name a fruit, you shouldn't reply with 'an apple is a fruit', rather you can reply with 'apple'."},
            { role: "user", content: input }
        ],
        })
  
        const aiText = completion.choices[0].message.content
        console.log(aiText)
        setPendingResponses(prev => ({ ...prev, ai: aiText }))
      } catch (err) {
        console.error("AI Error:", err)
        setPendingResponses(prev => ({ ...prev, ai: "⚠️ AI error. Try again." }))
      }
    }, 1200)
  }
  
  // function to deal with the user guess and open the corresponding modal
  const handleGuess = (anon) => {
    const pair = getLatestResponsePair()
    if (!pair) return
    const correct = anon === pair.whichIsHuman
    setGuessResult(correct)
    setModalOpen(true)
  }
  
  const handleCloseModal = () => {
    setModalOpen(false)
    setGuessResult(null)
  }

  return (
    <div className="app-container">
      <h1 className="title">The Imitation Game</h1>
      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, idx) => {
            if (msg.from === 'user') {
              return (
                <div key={idx} style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                  <span className="bubble-username">You</span>
                  <div className="message user">
                    {msg.text}
                  </div>
                </div>
              )
            } else if (msg.anon) {
              const alignLeft = msg.from === 'ai' || msg.from === 'human'
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: alignLeft ? 'flex-start' : 'flex-end'
                  }}
                >
                  <span className={`bubble-username${alignLeft ? ' left' : ''}`}>{msg.anon}</span>
                  <div className={`message ${msg.from === 'ai' ? 'ai align-left' : 'human'}`}>
                    {msg.text}
                  </div>
                </div>
              )
            } else {
              const alignLeft = msg.from !== 'user'
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: alignLeft ? 'flex-start' : 'flex-end'
                  }}
                >
                  <span className={`bubble-username${alignLeft ? ' left' : ''}`}>userXXXX</span>
                  <div className={`message ${msg.from === 'human' ? 'human' : 'ai align-left'}`}>
                    {msg.text}
                  </div>
                </div>
              )
            }
          })}
          <div ref={messagesEndRef} />
        </div>
        <form className="input-form" onSubmit={handleSend}>
          <input
            className="chat-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={waiting ? "" : "Type a message to play..."}
            disabled={waiting}
            autoFocus
          />
          <button type="submit" className="send-btn" disabled={waiting}>Send</button>
        </form>
        {waiting && (
          <div className="loader-container">
            <div className="loader"></div>
            <span className="loader-text">
              Waiting for responses from human and AI... 🤖🙎‍♂️
            </span>
          </div>
        )}
        <button className="nav-btn" style={{marginTop: 16}} onClick={handleReset}>Reset Game</button>
        {/* Guessing options */}
        {canGuess && (
          <div className="guess-section">
            <div style={{marginBottom: 8, color: "#b6ffb6", fontWeight: 500}}>Who is the Human?</div>
            <div style={{display: 'flex', gap: '12px'}}>
              {getLatestResponsePair().anons.map((anon) => (
                <button
                  key={anon}
                  className="guess-btn"
                  onClick={() => handleGuess(anon)}
                >
                  {anon}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Modals */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{fontSize: "1.3rem", fontWeight: 600, marginBottom: 12}}>
              {guessResult ? "Correct! 🎉" : "Wrong! ❌"}
            </div>
            <button className="nav-btn" onClick={() => { handleReset(); handleCloseModal(); }}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MainChat