// @ts-nocheck

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import  { Toaster } from 'react-hot-toast';
import {ThemeProvider} from './contexts/ThemeContext.tsx'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
    <App />
    </ThemeProvider>
    <Toaster />
  </StrictMode>,
)
