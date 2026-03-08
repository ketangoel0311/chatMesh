export const ConnectionStatus = ({ isConnected }) => (
  <div className="flex items-center gap-2 text-xs">
    <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-cyan-400' : 'bg-red-500'}`} />
    <span className="text-slate-400">{isConnected ? 'Online' : 'Offline'}</span>
  </div>
);
