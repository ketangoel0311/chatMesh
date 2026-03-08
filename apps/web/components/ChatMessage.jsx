export const ChatMessage = ({ message, isSent, highlight }) => {
  const name    = message.username || 'Unknown';
  const isFile  = message.type === 'file';
  const isImage = isFile && message.fileType && message.fileType.startsWith('image/');
  const isPdf   = isFile && message.fileType === 'application/pdf';

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} items-end gap-2`}>
      {!isSent && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700 flex-shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-xs`}>
        {!isSent && <span className="text-xs text-gray-600 mb-1 px-1">{name}</span>}
        <div className={`
          px-4 py-2 rounded-2xl transition-all duration-300
          ${isSent ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white' : 'bg-gray-800 text-white'}
          ${highlight ? 'ring-2 ring-emerald-400 scale-105' : ''}
        `}>
          {isFile ? (
            <div className="space-y-2">
              {isImage && message.fileUrl && (
                <a href={message.fileUrl} target="_blank" rel="noreferrer" download={message.filename || true} className="inline-block">
                  <img src={message.fileUrl} alt={message.filename || 'Image'} className="max-w-xs max-h-64 rounded-lg object-cover border border-white/20 cursor-pointer" />
                </a>
              )}
              {isPdf && message.fileUrl && (
                <a href={message.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm underline decoration-emerald-300 hover:decoration-emerald-100">
                  <span>PDF</span>
                  <span>{message.filename || 'Download'}</span>
                </a>
              )}
              {!isImage && !isPdf && message.filename && (
                <div className="text-sm break-all">{message.filename}</div>
              )}
            </div>
          ) : (
            <p className="text-sm leading-relaxed break-words">{message.text}</p>
          )}
          {message.timestamp && (
            <div className={`mt-1 text-xs opacity-70 ${isSent ? 'text-right' : 'text-left'}`}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>
      {isSent && (
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};
