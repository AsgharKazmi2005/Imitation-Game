// Imports :P
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import MainChat from './components/MainChat'
import HumanPage from './components/HumanPage'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainChat />} />
        <Route path="/human" element={<HumanPage />} />
      </Routes>
    </Router>
  )
}

export default App