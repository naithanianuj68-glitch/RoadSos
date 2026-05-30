import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Key } from 'lucide-react';
import { getClaudeResponse, checkHasKey, initClaudeClient } from '../services/claude';
import { getLocalTriageResponse } from '../services/localTriage';

export default function AIChatbot({ onFilterChange, isDemoMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: '🚨 **Emergency assistant active.**\n\nAre you safe right now? Tell me what happened.\n\n💡 *You can type in English, Hindi, Tamil, or Telugu.*' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasKey, setHasKey] = useState(checkHasKey());
  const [apiKeyInput, setApiKeyInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Listen for voice input from VoiceSOS component
  useEffect(() => {
    const handleVoiceInput = (e) => {
      const text = e.detail;
      if (text) {
        setIsOpen(true);
        setInput(text);
        // Small delay to ensure state is set before sending
        setTimeout(() => {
          const sendBtn = document.querySelector('[data-chatbot-send]');
          if (sendBtn) sendBtn.click();
        }, 300);
      }
    };
    window.addEventListener('voiceInput', handleVoiceInput);
    return () => window.removeEventListener('voiceInput', handleVoiceInput);
  }, []);

  const handleSaveKey = () => {
    if (apiKeyInput.trim()) {
      initClaudeClient(apiKeyInput.trim());
      setHasKey(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newMsgs = [...messages, { role: 'user', content: input }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = newMsgs.filter(m => m.role === 'user' || m.role === 'assistant');
      let reply;
      let filterCategory = null;
      
      if (isDemoMode || !hasKey) {
        // Use local trained triage engine
        await new Promise(r => setTimeout(r, 800)); // Simulate thinking
        const triage = getLocalTriageResponse(input);
        reply = triage.response;
        filterCategory = triage.filter;

        // Auto-trigger phone call if call intent detected
        if (triage.callNumber) {
          setTimeout(() => {
            window.open(`tel:${triage.callNumber}`, '_self');
          }, 500);
        }
      } else {
        // Try Claude API, fall back to local triage on error
        try {
          reply = await getClaudeResponse(apiMessages);
        } catch (apiError) {
          console.warn('Claude API failed, using local triage:', apiError);
          const triage = getLocalTriageResponse(input);
          reply = triage.response + '\n\n_⚡ Powered by offline triage engine_';
          filterCategory = triage.filter;

          if (triage.callNumber) {
            setTimeout(() => {
              window.open(`tel:${triage.callNumber}`, '_self');
            }, 500);
          }
        }
      }
      
      // Parse for FILTER tag from Claude API response
      if (!filterCategory) {
        const filterMatch = reply.match(/\[FILTER:(hospital|pharmacy|police|ambulance|mechanic)\]/i);
        if (filterMatch) {
          filterCategory = filterMatch[1].toLowerCase();
          reply = reply.replace(filterMatch[0], '').trim();
        }
      }

      // Apply filter
      if (filterCategory && onFilterChange) {
        onFilterChange(filterCategory);
      }

      setMessages([...newMsgs, { role: 'assistant', content: reply }]);
    } catch (error) {
      setMessages([...newMsgs, { role: 'assistant', content: "Error: " + error.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-transform active:scale-95 animate-bounce z-50"
        >
          <MessageSquare size={32} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-0 right-0 w-full sm:w-96 h-3/4 sm:h-[500px] sm:bottom-6 sm:right-6 bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg flex items-center space-x-2">
                <span>AI Triage</span>
                {isDemoMode && <span className="text-[10px] bg-purple-500 px-2 py-0.5 rounded-full uppercase tracking-widest">Demo</span>}
              </h2>
              <p className="text-xs opacity-80">Fast emergency guidance</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-blue-700 rounded-full">
              <X size={24} />
            </button>
          </div>
          {(
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-900">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 px-4 shadow-md ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-3xl rounded-tr-sm' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-3xl rounded-tl-sm border border-gray-100 dark:border-gray-700'}`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed" dangerouslySetInnerHTML={{ 
                        __html: msg.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/_(.*?)_/g, '<em class="opacity-70">$1</em>')
                          .replace(/^• /gm, '<span class="text-blue-500">●</span> ')
                      }} />
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-800 p-3 px-4 rounded-3xl rounded-tl-sm shadow-md border border-gray-100 dark:border-gray-700 flex space-x-1 items-center h-10">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
                <div className="flex space-x-2">
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your emergency..."
                    className="flex-1 p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button 
                    onClick={handleSend}
                    data-chatbot-send="true"
                    disabled={loading || !input.trim()}
                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send size={24} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
