import React from 'react'
import { AppRouter } from './routes/AppRouter'
import { ThemeProvider } from './context/ThemeContext' // Importa el Provider

function App() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  )
}

export default App