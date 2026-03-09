'use client';

import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketProvider';
import { ChatMessage, ConnectionStatus, MessageInput, UserList } from '../components';

export default function Page() {
  const {
    messages, isConnected, roomId,
    createRoom, joinRoom, leaveRoom,
    username, roomUsers, userId,
  } = useSocket();

  const [view,          setView]          = useState('entry');
  const [createName,    setCreateName]    = useState('');
  const [joinName,      setJoinName]      = useState('');
  const [joinRoomInput, setJoinRoomInput] = useState('');
  const [highlightId,   setHighlightId]   = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const lastRoomId   = localStorage.getItem('lastRoomId');
    const lastUsername = localStorage.getItem('lastUsername');
    if (lastRoomId && isConnected) {
      joinRoom(lastRoomId, lastUsername || 'User');
      setView('chat');
    }
  }, [isConnected, joinRoom]);

  useEffect(() => {
    if (roomId && isConnected) {
      setView('chat');
      localStorage.setItem('lastRoomId', roomId);
      if (username) localStorage.setItem('lastUsername', username);
    }
  }, [roomId, isConnected, username]);

  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    setHighlightId(last.id);
    const t = setTimeout(() => setHighlightId(null), 900);
    return () => clearTimeout(t);
  }, [messages]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!createName.trim()) return;
    createRoom(createName.trim());
    setCreateName('');
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!joinRoomInput.trim() || !joinName.trim()) return;
    joinRoom(joinRoomInput.trim().toUpperCase(), joinName.trim());
    setJoinName('');
    setJoinRoomInput('');
  };

  const handleLeave = () => {
    localStorage.removeItem('lastRoomId');
    localStorage.removeItem('lastUsername');
    leaveRoom();
    setView('entry');
  };

  if (view === 'entry') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">chatMesh</h1>
            <p className="mt-2 text-sm text-gray-600">Connect with a unique room ID</p>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm p-6 border border-emerald-200/50">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create a Room</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-teal-700 transition">
                  Create Room
                </button>
              </div>
            </form>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-sm text-gray-500 font-medium">or</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            <form onSubmit={handleJoin} className="bg-white rounded-xl shadow-sm p-6 border border-teal-200/50">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Join a Room</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room ID</label>
                  <input
                    type="text"
                    value={joinRoomInput}
                    onChange={(e) => setJoinRoomInput(e.target.value.toUpperCase())}
                    placeholder="e.g. A4BX9KQZ"
                    maxLength="8"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 font-mono focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
                  <input
                    type="text"
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-medium rounded-lg hover:from-teal-700 hover:to-emerald-700 transition">
                  Join Room
                </button>
              </div>
            </form>
          </div>

          {!isConnected && (
            <p className="text-center text-sm text-amber-600">Connecting to server...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <header className="bg-white border-b border-emerald-200/50 shadow-sm">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">chatMesh</h1>
            <div className="flex items-center gap-3 mt-1">
              <code className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-mono rounded">{roomId}</code>
              <button
                onClick={() => navigator.clipboard.writeText(roomId)}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
              >
                Copy
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ConnectionStatus isConnected={isConnected} />
            <button onClick={handleLeave} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
              Leave Room
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {messages.length === 0 && (
              <p className="text-center text-gray-400 text-sm">No messages yet. Say hello.</p>
            )}
            <div className="space-y-4">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isSent={msg.userId === userId || msg.from === userId}
                  highlight={msg.id === highlightId}
                />
              ))}
            </div>
            <div ref={bottomRef} />
          </div>
        </main>
        <UserList users={roomUsers} currentUsername={username} />
      </div>

      <MessageInput />
    </div>
  );
}
