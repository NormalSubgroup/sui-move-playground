import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 引入Monaco编辑器
import * as monaco from 'monaco-editor';
// 引入Move语言支持
import { registerMoveLanguage } from './languages/move';

// 注册Move语言支持
if (typeof window !== 'undefined') {
  registerMoveLanguage();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
