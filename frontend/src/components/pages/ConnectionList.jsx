import React, { useState } from 'react';
import '../styles/ConnectionList.css'; // 引入样式文件
import { useSelector, useDispatch } from 'react-redux';
import { removeConnection } from '../../store/modules/ConnectionList';

const ConnectionList = () => {
  const connections = useSelector(state => state.connectionList);
  const dispatch = useDispatch();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleDelete = (id) => {
    dispatch(removeConnection(id));
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
              key={conn.id}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
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
