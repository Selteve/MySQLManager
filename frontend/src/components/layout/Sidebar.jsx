import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ 
  databases, 
  selectedDb, 
  setSelectedDb, 
  tables, 
  selectedTable, 
  setSelectedTable, 
  isSidebarCollapsed, 
  toggleSidebar, 
  isConnected,
  connectionList,
  handleBackgroundImageChange
}) => {
  return (
    <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-content">
        <h2>MySQL 管理器</h2>
        <Link to="/connections">
          <h3>连接列表</h3>
        </Link>
        <Link to="/">
          <h3>新建连接</h3>
        </Link>
        <div className="database-selector">
          <select value={selectedDb} onChange={(e) => setSelectedDb(e.target.value)}>
            <option value="">选择数据库</option>
            {databases.map(db => (
              <option key={db} value={db}>{db}</option>
            ))}
          </select>
          <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
            <option value="">选择表格</option>
            {tables.map(table => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
        </div>
        <div className="background-image-setting">
          <label htmlFor="background-image" className="custom-file-upload">
            <i className="fas fa-image"></i> 设置背景图片
          </label>
          <input
            type="file"
            id="background-image"
            accept="image/*"
            onChange={handleBackgroundImageChange}
          />
        </div>
      </div>
      <button className={`toggle-sidebar ${isConnected ? 'connected' : ''}`} onClick={toggleSidebar}>
        <i className={`fas fa-chevron-${isSidebarCollapsed ? 'right' : 'left'}`}></i>
      </button>
    </div>
  );
};

export default Sidebar;