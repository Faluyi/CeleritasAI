import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useOrganizations } from '../contexts/OrganizationContext';
import { chatService } from '../services/api';

const ChatInterface = () => {
  const { organizations, selectedOrg, setSelectedOrg } = useOrganizations();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedOrg) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError(null);

    try {
      const response = await chatService.query(inputMessage, selectedOrg.id);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.response,
        sources: response.data.sources,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError('Failed to get response. Please try again.');
      console.error('Error getting chat response:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Chat Interface</Typography>
        <Button variant="outlined" onClick={clearChat}>
          Clear Chat
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Organization Selector */}
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Organization</InputLabel>
          <Select
            value={selectedOrg?.id || ''}
            onChange={(e) => {
              const org = organizations.find(o => o.id === e.target.value);
              setSelectedOrg(org);
            }}
            label="Select Organization"
          >
            {organizations.map((org) => (
              <MenuItem key={org.id} value={org.id}>
                {org.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Chat Messages */}
      <Paper sx={{ height: '500px', overflow: 'auto', mb: 2, p: 2 }}>
        {messages.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography variant="body1" color="text.secondary">
              Start a conversation by typing a message below
            </Typography>
          </Box>
        ) : (
          <List>
            {messages.map((message) => (
              <React.Fragment key={message.id}>
                <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ 
                    alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    mb: 1
                  }}>
                    <Chip 
                      label={message.type === 'user' ? 'You' : 'Assistant'} 
                      color={message.type === 'user' ? 'primary' : 'secondary'}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Card sx={{ 
                      bgcolor: message.type === 'user' ? 'primary.light' : 'grey.100',
                      color: message.type === 'user' ? 'white' : 'text.primary'
                    }}>
                      <CardContent>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {message.content}
                        </Typography>
                      </CardContent>
                    </Card>
                    
                    {/* Show sources for bot messages */}
                    {message.sources && message.sources.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Sources:
                        </Typography>
                        {message.sources.map((source, index) => (
                          <Chip
                            key={index}
                            label={source.title}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1, mt: 0.5 }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
            
            {loading && (
              <ListItem>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    Assistant is thinking...
                  </Typography>
                </Box>
              </ListItem>
            )}
            
            <div ref={messagesEndRef} />
          </List>
        )}
      </Paper>

      {/* Message Input */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type your message here..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!selectedOrg || loading}
        />
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || !selectedOrg || loading}
        >
          Send
        </Button>
      </Box>

      {!selectedOrg && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Please select an organization to start chatting
        </Alert>
      )}
    </Box>
  );
};

export default ChatInterface;
