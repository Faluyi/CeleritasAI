import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, AppBar, Toolbar, Typography, Tabs, Tab, Box } from '@mui/material';
import DocumentManager from './components/DocumentManager';
import ChatInterface from './components/ChatInterface';
import { OrganizationProvider } from './contexts/OrganizationContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <OrganizationProvider>
        <Router>
          <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  RAG Document Management System
                </Typography>
              </Toolbar>
            </AppBar>
            
            <Container maxWidth="lg" sx={{ mt: 4 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={currentTab} onChange={handleTabChange}>
                  <Tab label="Document Management" />
                  <Tab label="Chat Interface" />
                </Tabs>
              </Box>
              
              {currentTab === 0 && <DocumentManager />}
              {currentTab === 1 && <ChatInterface />}
            </Container>
          </Box>
        </Router>
      </OrganizationProvider>
    </ThemeProvider>
  );
}

export default App;
