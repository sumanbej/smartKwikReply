import { useState, useCallback } from 'react'
import type { FC, JSX } from 'react'
import './App.css'

import axios from 'axios'

const SendIcon: FC = () => <span aria-hidden>✉️</span>
const ContentCopyIcon: FC = () => <span aria-hidden>📋</span>
const DarkModeIcon: FC = () => <span aria-hidden>🌙</span>
const LightModeIcon: FC = () => <span aria-hidden>☀️</span>
import {
  AppBar,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Toolbar,
  Typography,
  Alert,
  Tooltip,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material' // type-only import to satisfy verbatimModuleSyntax

axios.defaults.baseURL = 'http://localhost:9000'
axios.defaults.withCredentials = true

export default function App(): JSX.Element {
  const [emailContent, setEmailContent] = useState('')
  const [tone, setTone] = useState('')
  const [generatedReply, setGeneratedReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState('')
  const [dark, setDark] = useState(false)
  const [snack, setSnack] = useState<{ open: boolean; message?: string; severity?: 'success' | 'error' | 'info' }>({
    open: false,
  })

  const handleSubmit = useCallback(async () => {
    if (!emailContent.trim()) return
    setLoading(true)
    setErrors('')
    setGeneratedReply('')
    try {
      const res = await axios.post('/api/email-reply/reply', { content: emailContent, tone })
      const data = typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2)
      setGeneratedReply(data)
      setSnack({ open: true, message: 'Reply generated', severity: 'success' })
    } catch (err) {
      console.error(err)
      setErrors('Failed to generate reply. Please try again.')
      setSnack({ open: true, message: 'Generation failed', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [emailContent, tone])

  const handleCopy = async () => {
    if (!generatedReply) return
    try {
      await navigator.clipboard.writeText(generatedReply)
      setSnack({ open: true, message: 'Copied to clipboard', severity: 'success' })
    } catch {
      setSnack({ open: true, message: 'Copy failed', severity: 'error' })
    }
  }

  const handleToneChange = (e: SelectChangeEvent) => {
    setTone(e.target.value as string)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      void handleSubmit()
    }
  }

  return (
    <div className={dark ? 'app-root dark' : 'app-root'}>
      <AppBar position="static" className="topbar" elevation={0}>
        <Toolbar>
          <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>SKwik</Avatar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            SmartKwikReply
          </Typography>

          <Tooltip title={dark ? 'Switch to light' : 'Switch to dark'}>
            <IconButton aria-label="toggle theme" color="inherit" onClick={() => setDark((s) => !s)} size="large">
              {dark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" className="container">
        <Paper className="glass-card" elevation={6}>
          <Box className="header-row">
            <div>
              <Typography variant="h4" component="h1" gutterBottom>
                Email Reply Generator
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paste an email and choose a tone. AI drafts a concise reply you can copy or tweak.
              </Typography>
            </div>

            <div className="cta-col" aria-hidden={loading}>
              <Button
                variant="contained"
                startIcon={loading ? undefined : <SendIcon />}
                onClick={handleSubmit}
                disabled={!emailContent.trim() || loading}
                className="generate-btn"
                size="medium"
                aria-label="generate-reply"
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Generate'}
              </Button>
            </div>
          </Box>

          <Divider sx={{ my: 2 }} />

          <TextField
            label="Original Email"
            placeholder="Paste the email content here..."
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            multiline
            rows={6}
            fullWidth
            variant="outlined"
            className="email-input"
            onKeyDown={handleKeyDown}
            inputProps={{ 'aria-label': 'original-email' }}
            helperText="Tip: press ⌘/Ctrl + Enter to generate"
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel id="tone-label">Tone</InputLabel>
              <Select labelId="tone-label" value={tone} label="Tone" onChange={handleToneChange}>
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="casual">Casual</MenuItem>
                <MenuItem value="friendly">Friendly</MenuItem>
                <MenuItem value="">None</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ flex: 1 }} />

            <Typography variant="caption" color="text.secondary">
              Keep prompts short for concise replies
            </Typography>
          </Box>

          {errors && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errors}
            </Alert>
          )}

          {generatedReply && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Generated Reply
              </Typography>

              <TextField
                value={generatedReply}
                multiline
                rows={6}
                fullWidth
                variant="outlined"
                InputProps={{ readOnly: true }}
                className="reply-output"
                inputProps={{ 'aria-label': 'generated-reply' }}
              />

              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopy} aria-label="copy-reply">
                  Copy
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    void navigator.clipboard.writeText(generatedReply)
                    setSnack({ open: true, message: 'Copied', severity: 'success' })
                  }}
                >
                  Quick Copy
                </Button>
                <Button
                  variant="text"
                  onClick={() => {
                    setGeneratedReply('')
                  }}
                >
                  Clear
                </Button>
              </Box>
            </>
          )}
        </Paper>

        <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', mt: 3 }}>
          Built with React + MUI · Backend: http://localhost:xxxx
        </Typography>
      </Container>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity || 'info'} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </div>
  )
}