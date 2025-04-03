import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SnackbarProvider } from 'notistack'
import CustomSnackbar from './CustomSnackbar'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      autoHideDuration={3000}
      components={{
        success: (props) => <CustomSnackbar {...props} variant="success" />,
        error: (props) => <CustomSnackbar {...props} variant="error" />,
        warning: (props) => <CustomSnackbar {...props} variant="warning" />,
        info: (props) => <CustomSnackbar {...props} variant="info" />,
      }}
    >
      <App />
    </SnackbarProvider>
  </StrictMode>
)
