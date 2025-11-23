'use client'
import { useState, useRef, useEffect } from 'react'
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi'
import { createClient } from '@/utils/supabase/client'

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface ChatbotProps {
  webhookUrl?: string
}

// Helper function to generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper function to get/set cookie
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number = 30): void {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
}

export default function Chatbot({ 
  webhookUrl = 'https://n8n.jekoyu.dev/webhook/chatbot-dbd' 
}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Halo! Saya asisten virtual untuk membantu Anda dengan informasi seputar demam berdarah. Ada yang bisa saya bantu?',
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Initialize session and check user login status
  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
          console.log('User logged in:', user.id)
        } else {
          console.log('User not logged in')
        }
      } catch (error) {
        console.error('Error checking user:', error)
      }
    }

    // Get or create session ID
    let existingSessionId = getCookie('chatbot_session_id')
    if (!existingSessionId) {
      existingSessionId = generateUUID()
      setCookie('chatbot_session_id', existingSessionId, 30) // 30 days
      console.log('Created new session ID:', existingSessionId)
    } else {
      console.log('Using existing session ID:', existingSessionId)
    }
    
    setSessionId(existingSessionId)
    checkUser()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading || !sessionId) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    try {
      // Build URL with session management
      const params = new URLSearchParams({
        message: userMessage.text,
        session_id: sessionId,
        ...(userId && { user_id: userId }), // Add user_id if logged in
        timestamp: new Date().toISOString()
      })
      
      const fullUrl = `${webhookUrl}?${params.toString()}`
      console.log('Calling webhook URL:', fullUrl)
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Get response as text first
      const responseText = await response.text()
      console.log('Raw response:', responseText)
      
      // Check if response is empty
      if (!responseText.trim()) {
        console.warn('Empty response from N8N webhook')
        // Return fallback message instead of throwing error
        const fallbackMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: 'Maaf, saya sedang mengalami gangguan. Silakan coba lagi dalam beberapa saat.',
          isUser: false,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, fallbackMessage])
        return
      }

      let botResponseText = ''

      // Try to parse as JSON first
      try {
        const data = JSON.parse(responseText)
        
        if (data.response) {
          botResponseText = data.response
        } else if (data.message) {
          botResponseText = data.message
        } else if (data.text) {
          botResponseText = data.text
        } else if (data.reply) {
          botResponseText = data.reply
        } else if (typeof data === 'string') {
          botResponseText = data
        } else {
          botResponseText = 'Maaf, format respons tidak valid.'
        }
      } catch (jsonError) {
        // If not JSON, treat as plain text
        botResponseText = responseText.trim()
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponseText || 'Maaf, saya tidak mendapat respons yang valid.',
        isUser: false,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi.',
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105"
        >
          <FiMessageCircle size={22} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 h-[28rem] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 flex justify-between items-center">
            <div>
              <h3 className="font-medium text-sm">Asisten DBD</h3>
              <p className="text-xs opacity-90">Tanya tentang demam berdarah</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-1.5 transition-all duration-200"
            >
              <FiX size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed ${
                    message.isUser
                      ? 'bg-red-500 text-white rounded-2xl rounded-br-md shadow-sm'
                      : 'bg-white text-gray-700 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-700 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tulis pesan..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim() || isLoading}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl p-2.5 transition-all duration-200 shadow-sm"
              >
                <FiSend size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}