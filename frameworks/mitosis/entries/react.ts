import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../output/react/src/App.jsx'

ReactDOM
  .createRoot(document.getElementById('app')!)
  .render(React.createElement(App))
