import React, { useState, useEffect, useRef } from 'react';
import { ConnectToMySQL, GetDatabases, GetTables, GetTableData, UpdateTableData, InsertTableData, DeleteTableData, ExecuteQuery } from '../../wailsjs/go/main/App';
import './index.css';

// 新增自定义模态框组件
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-effect">
        {children}
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

const MySQLManager = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('3306');
  const [dbName, setDbName] = useState('');
  const [databases, setDatabases] = useState([]);
  const [selectedDb, setSelectedDb] = useState('');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableData, setTableData] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [newRow, setNewRow] = useState({});
  const [customQuery, setCustomQuery] = useState('');
  const [queryResult, setQueryResult] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mainContentRef = useRef(null);

  const handleConnect = async () => {
    const dsn = `${username}:${password}@tcp(${host}:${port})/${dbName}?charset=utf8mb4&parseTime=True&loc=Local`;
    try {
      await ConnectToMySQL(dsn);
      const dbs = await GetDatabases();
      setDatabases(dbs);
      setIsConnected(true);
      setIsModalOpen(true);
    } catch (error) {
      console.error('连接失败:', error);
      alert('连接失败: ' + error.message);
    }
  };

  useEffect(() => {
    if (selectedDb) {
      GetTables(selectedDb).then(setTables).catch(console.error);
    }
  }, [selectedDb]);

  useEffect(() => {
    if (selectedDb && selectedTable) {
      GetTableData(selectedDb, selectedTable).then(setTableData).catch(console.error);
    }
  }, [selectedDb, selectedTable]);

  const handleEdit = (row) => {
    setEditingRow(row);
  };

  const handleSave = async () => {
    try {
      await UpdateTableData(selectedDb, selectedTable, editingRow.id, editingRow);
      setEditingRow(null);
      // 刷新表格数据
      const updatedData = await GetTableData(selectedDb, selectedTable);
      setTableData(updatedData);
    } catch (error) {
      console.error('更新失败:', error);
      alert('更新失败: ' + error.message);
    }
  };

  const handleAdd = async () => {
    try {
      await InsertTableData(selectedDb, selectedTable, newRow);
      setNewRow({});
      // 刷新表格数据
      const updatedData = await GetTableData(selectedDb, selectedTable);
      setTableData(updatedData);
    } catch (error) {
      console.error('添加失败:', error);
      alert('添加失败: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      try {
        await DeleteTableData(selectedDb, selectedTable, id);
        // 刷新表格数据
        const updatedData = await GetTableData(selectedDb, selectedTable);
        setTableData(updatedData);
      } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败: ' + error.message);
      }
    }
  };

  const handleExecuteQuery = async () => {
    try {
      const result = await ExecuteQuery(selectedDb, customQuery);
      setQueryResult(result);
    } catch (error) {
      console.error('查询执行失败:', error);
      alert('查询执行失败: ' + error.message);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleBackgroundImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const updateMainContentWidth = () => {
      if (mainContentRef.current) {
        const sidebarWidth = isSidebarCollapsed ? 60 : 250; // 根据实际宽度调整
        mainContentRef.current.style.maxWidth = `calc(100vw - ${sidebarWidth + 40}px)`; // 40px 为内边距
      }
    };

    updateMainContentWidth();
    window.addEventListener('resize', updateMainContentWidth);

    return () => window.removeEventListener('resize', updateMainContentWidth);
  }, [isSidebarCollapsed]);

  return (
    <div className="mysql-manager" style={{backgroundImage: `url(${backgroundImage})`}}>
      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-content">
          <h2>MySQL 管理器</h2>
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
      <div className="main-content" ref={mainContentRef}>
        <div className="top-bar glass-effect">
          <div className="connection-form">
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="用户名" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" />
            <input type="text" value={host} onChange={(e) => setHost(e.target.value)} placeholder="主机地址" />
            <input type="text" value={port} onChange={(e) => setPort(e.target.value)} placeholder="端口" />
            <input type="text" value={dbName} onChange={(e) => setDbName(e.target.value)} placeholder="数据库名称" />
            <button className="primary-button" onClick={handleConnect}>连接</button>
          </div>
        </div>
        <div className="table-container glass-effect">
          {tableData.length > 0 && (
            <table>
              <thead>
                <tr>
                  {Object.keys(tableData[0]).map(key => (
                    <th key={key}>{key}</th>
                  ))}
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index}>
                    {Object.entries(row).map(([key, value]) => (
                      <td key={key}>
                        {editingRow && editingRow.id === row.id ? (
                          <input
                            value={editingRow[key]}
                            onChange={(e) => setEditingRow({...editingRow, [key]: e.target.value})}
                          />
                        ) : (
                          value !== null ? value.toString() : 'NULL'
                        )}
                      </td>
                    ))}
                    <td>
                      <div className="action-buttons">
                        {editingRow && editingRow.id === row.id ? (
                          <button className="action-button primary-button" onClick={handleSave}>保存</button>
                        ) : (
                          <>
                            <button className="action-button primary-button" onClick={() => handleEdit(row)}>编辑</button>
                            <button className="action-button danger-button" onClick={() => handleDelete(row.id)}>删除</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="new-row">
                  {Object.keys(tableData[0]).map(key => (
                    <td key={key}>
                      <input
                        value={newRow[key] || ''}
                        onChange={(e) => setNewRow({...newRow, [key]: e.target.value})}
                        placeholder={`新 ${key}`}
                      />
                    </td>
                  ))}
                  <td>
                    <button className="action-button primary-button" onClick={handleAdd}>添加</button>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
        <div className="bottom-bar glass-effect">
          <div className="custom-query">
            <textarea
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="输入自定义 SQL 查询"
            />
            <button className="primary-button" onClick={handleExecuteQuery}>执行查询</button>
          </div>
          {queryResult.length > 0 && (
            <div className="query-result">
              <h3>查询结果</h3>
              <table>
                <thead>
                  <tr>
                    {Object.keys(queryResult[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queryResult.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td key={i}>{value !== null ? value.toString() : 'NULL'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>连接成功</h2>
        <p>已成功连接到 MySQL 数据库。</p>
      </Modal>
    </div>
  );
};

export default MySQLManager;