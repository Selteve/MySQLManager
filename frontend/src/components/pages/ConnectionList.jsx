import React, { useState } from 'react';
import '../styles/ConnectionList.css'; // 引入样式文件
import { useSelector, useDispatch } from 'react-redux';
import { removeConnection } from '../../store/modules/ConnectionList';

const ConnectionList = ({ onSwitchDatabase }) => {
  const connections = useSelector(state => state.connectionList);
  const dispatch = useDispatch();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [message, setMessage] = useState('');

  const handleDelete = (id) => {
    dispatch(removeConnection(id));
  };

  const handleSwitchDatabase = (connection) => {
    const success = onSwitchDatabase(connection);
    if (success) {
      setMessage(`成功切换到数据库: ${connection.username}`);
    } else {
      setMessage(`切换数据库失败`);
    }
  };

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
              onClick={() => handleSwitchDatabase(conn)} // 点击行切换数据库
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