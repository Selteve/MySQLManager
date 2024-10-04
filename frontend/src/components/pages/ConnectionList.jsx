import React, { useState } from 'react';
import '../styles/ConnectionList.css'; // 引入样式文件

const ConnectionList = () => {
  const [connections, setConnections] = useState([
    { name: '连接1', host: 'localhost', port: '3306', dbName: 'test_db' },
    { name: '连接2', host: '192.168.1.1', port: '3306', dbName: 'prod_db' }
  ]);

  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleDelete = (index) => {
    const updatedConnections = connections.filter((_, i) => i !== index);
    setConnections(updatedConnections);
  };

  return (
    <div className="editable-connection-list">
      <h2>连接列表</h2>
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
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <td>{conn.name}</td>
              <td>{conn.host}</td>
              <td>{conn.port}</td>
              <td>{conn.dbName}</td>
              <td>
                {hoveredIndex === index && (
                  <button onClick={() => handleDelete(index)}>删除</button>
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
