'use client';

import { useState } from 'react';
import { useSocket } from '../context/SocketProvider';

export const MessageInput = () => {
  const { sendMessage, isConnected, roomId, userId, username } = useSocket();
  const [value,       setValue]       = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';

  const send = () => {
    if (!value.trim()) return;
    sendMessage(value);
    setValue('');
  };

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file || !roomId || !userId || !isConnected) return;

    const form = new FormData();
    form.append('file',     file);
    form.append('roomId',   roomId);
    form.append('userId',   userId);
    form.append('username', username || 'Unknown');

    try {
      setIsUploading(true);
      await fetch(baseUrl + '/upload', { method: 'POST', body: form });
    } catch (_) {
    } finally {
      setIsUploading(false);
    }
  };

  const placeholder = isUploading ? 'Uploading...' : isConnected ? 'Type a message' : 'Connecting...';

  return (
    <div className="bg-white border-t border-emerald-200/50 px-6 py-4">
      <div className="max-w-4xl mx-auto flex gap-3 items-center">
        <label className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100 transition select-none">
          <span className="sr-only">Attach file</span>
          <span className="text-gray-500 text-sm font-semibold leading-none">+</span>
          <input
            type="file"
            accept="image/png,image/jpeg,application/pdf"
            className="hidden"
            onChange={handleFile}
            disabled={!isConnected || !roomId || isUploading}
          />
        </label>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={!isConnected}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={!value.trim() || !isConnected}
          className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
};
