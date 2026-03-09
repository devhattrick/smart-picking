import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // <-- บรรทัดนี้สำคัญมากครับ ต้องมีเพื่อดึง CSS มาใช้

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
