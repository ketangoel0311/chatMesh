export const UserList = ({ users, currentUsername }) => (
  <div className="w-64 bg-white border-l border-emerald-200/50 p-4 overflow-y-auto">
    <h3 className="text-sm font-semibold text-gray-700 mb-3">Users in Room</h3>
    <div className="space-y-2">
      {users && users.length > 0 ? (
        users.map((user) => (
          <div key={user.socketId} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-semibold text-emerald-700 flex-shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-700 truncate">
              {user.username}
              {user.username === currentUsername && (
                <span className="ml-1 text-emerald-600">(You)</span>
              )}
            </span>
          </div>
        ))
      ) : (
        <p className="text-xs text-gray-500">No users</p>
      )}
    </div>
  </div>
);
