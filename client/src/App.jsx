import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Create from './pages/Create.jsx'
import MyQuizzes from './pages/MyQuizzes.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/testlarim" element={<MyQuizzes />} />
      <Route path="/yaratish" element={<Create />} />
      <Route path="/yaratish/:id" element={<Create />} />
      {/* Kelgusi ekranlar:
          <Route path="/host/:pin" element={<Host />} />
          <Route path="/o'yin/:pin" element={<Play />} />  */}
      <Route path="*" element={<Landing />} />
    </Routes>
  )
}
