import React from 'react';
import '../styles/ConnectionList.css';
import useDatabaseConnection from '../../hooks/useDatabaseConnection';

const ConnectionList = ({ onSwitchDatabase }) => {
  const {
    connections,
    hoveredIndex,
    setHoveredIndex,
    message,
    handleDelete,
    handleSwitchDatabase
  } = useDatabaseConnection();

  if (!connections || connections.length === 0) {
    return (
      <div className="editable-connection-list">
        <h2>连接列表</h2>
        {message && <div className="message">{message}</div>}
        <div className="empty-state">
          暂无保存的连接
        </div>
      </div>
    );
  }

  return (
    <div className="editable-connection-list">
      <h2>连接列表</h2>
      {message && <div className="message">{message}</div>}
      <table className="editable-connection-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>主机</th>
            <th>端口</th>
            <th>数据库名</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {connections.map((conn, index) => (
            <tr 
              key={conn.id || index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <td>{conn.username}</td>
              <td>{conn.host}</td>
              <td>{conn.port}</td>
              <td>{conn.dbName}</td>
              <td>
                {hoveredIndex === index && (
                  <>
                    <button onClick={() => handleSwitchDatabase(conn, onSwitchDatabase)}>切换</button>
                    <button onClick={() => handleDelete(conn.id)}>删除</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConnectionList;