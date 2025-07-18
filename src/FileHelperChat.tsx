import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paperclip, Image as ImageIcon } from 'lucide-react';

export default function FileHelperChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [pastedFiles, setPastedFiles] = useState([]); // 新增：存储粘贴的文件
  const fileInputRef = useRef(null);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  const handleSend = () => {
    if (input.trim() === '' && pastedFiles.length === 0) return;
    
    // 发送文本消息
    if (input.trim() !== '') {
      setMessages(prev => [...prev, { type: 'text', content: input, timestamp: new Date() }]);
    }
    
    // 发送粘贴的文件
    pastedFiles.forEach(file => {
      setMessages(prev => [...prev, { 
        type: file.type, 
        content: file.content, 
        timestamp: new Date() 
      }]);
    });
    
    setInput('');
    setPastedFiles([]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const newFiles = [];
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        newFiles.push({ type: 'image', content: url });
      } else {
        newFiles.push({ type: 'file', content: file.name });
      }
    });
    
    if (newFiles.length > 0) {
      setPastedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    const newFiles = [];
    
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        const url = URL.createObjectURL(blob);
        newFiles.push({ type: 'image', content: url });
      } else if (item.type === 'text/plain') {
        // 文本内容直接添加到输入框
        item.getAsString(text => {
          setInput(prev => prev + text);
        });
      }
    }
    
    if (newFiles.length > 0) {
      setPastedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        newFiles.push({ type: 'image', content: url });
      } else {
        newFiles.push({ type: 'file', content: file.name });
      }
    });
    
    if (newFiles.length > 0) {
      setPastedFiles(prev => [...prev, ...newFiles]);
    }
    
    // 重置文件输入框
    e.target.value = '';
  };

  const removePastedFile = (index) => {
    setPastedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  useEffect(() => {
    const inputEl = inputRef.current;
    if (inputEl) {
      inputEl.addEventListener('paste', handlePaste);
    }
    return () => {
      if (inputEl) {
        inputEl.removeEventListener('paste', handlePaste);
      }
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto h-[90vh] flex flex-col border rounded-2xl shadow p-4">
      <Card className="flex-1 overflow-hidden">
        <CardContent
          className="h-full p-2"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          ref={chatRef}
        >
          <ScrollArea className="h-full">
            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="flex-1 p-3 rounded-lg bg-muted">
                    {msg.type === 'text' && <p>{msg.content}</p>}
                    {msg.type === 'file' && (
                      <p className="text-blue-500 flex items-center gap-1">
                        <Paperclip size={16} /> {msg.content}
                      </p>
                    )}
                    {msg.type === 'image' && <img src={msg.content} alt="pasted" className="max-w-xs rounded" />}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 flex-shrink-0">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 粘贴文件预览区域 */}
      {pastedFiles.length > 0 && (
        <div className="flex gap-2 p-2 bg-gray-50 rounded-lg mb-2">
          {pastedFiles.map((file, idx) => (
            <div key={idx} className="relative">
              {file.type === 'image' && (
                <img 
                  src={file.content} 
                  alt="preview" 
                  className="w-12 h-12 object-cover rounded border"
                />
              )}
              {file.type === 'file' && (
                <div className="w-12 h-12 bg-blue-100 rounded border flex items-center justify-center">
                  <Paperclip size={16} className="text-blue-600" />
                </div>
              )}
              <button
                onClick={() => removePastedFile(idx)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-2">
        <Button variant="outline" size="icon" onClick={() => fileInputRef.current.click()}>
          <Paperclip />
        </Button>
        <input
          type="file"
          hidden
          multiple
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
        <Input
          ref={inputRef}
          className="flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息，或粘贴图片"
        />
        <Button onClick={handleSend}>发送</Button>
      </div>
    </div>
  );
}