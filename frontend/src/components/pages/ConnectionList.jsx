import React from 'react';
import '../styles/ConnectionList.css'; // 引入样式文件
import useDatabaseConnection from '../../hooks/useDatabaseConnection';

const ConnectionList = ({ onSwitchDatabase, initialConnections }) => {
  const {
    connections,
    setConnections,
    hoveredIndex,
    setHoveredIndex,
    message,
    handleDelete,
    handleSwitchDatabase
  } = useDatabaseConnection(initialConnections);

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
              key={conn.id}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleSwitchDatabase(conn, onSwitchDatabase)} // 点击行切换数据库
            >
              <td>{conn.username}</td>
              <td>{conn.host}</td>
              <td>{conn.port}</td>
              <td>{conn.dbName}</td>
              <td>
                {hoveredIndex === index && (
                  <button onClick={() => handleDelete(conn.id)}>删除</button>
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