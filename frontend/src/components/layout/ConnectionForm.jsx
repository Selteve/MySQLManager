import React from 'react';

const ConnectionForm = ({ 
  username, 
  setUsername, 
  password, 
  setPassword, 
  host, 
  setHost, 
  port, 
  setPort, 
  dbName, 
  setDbName, 
  handleConnect, 
  isConnecting 
}) => {
  return (
    <div className="top-bar glass-effect">
      <div className="connection-form">
        <input
          type="text"
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="主机"
          value={host}
          onChange={(e) => setHost(e.target.value)}
        />
        <input
          type="text"
          placeholder="端口"
          value={port}
          onChange={(e) => setPort(e.target.value)}
        />
        <input
          type="text"
          placeholder="数据库名称"
          value={dbName}
          onChange={(e) => setDbName(e.target.value)}
        />
        <button className="primary-button" onClick={handleConnect} disabled={isConnecting}>
          {isConnecting ? '连接中...' : '连接'}
        </button>
      </div>
    </div>
  );
};

export default ConnectionForm;
