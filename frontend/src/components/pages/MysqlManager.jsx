import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addConnection } from '../../store/modules/ConnectionList';
import { ConnectToMySQL, GetDatabases, GetTables, GetTableData, UpdateTableData, InsertTableData, DeleteTableData, ExecuteQuery } from '../../../wailsjs/go/main/App';
import Sidebar from '../layout/Sidebar';
import ConnectionForm from '../layout/ConnectionForm';
import TableView from './TableView';
import CustomQuerySection from '../common/CustomQuerySection';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import ConnectionList from './ConnectionList';
import '../styles/index.css';

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
  const [isConnecting, setIsConnecting] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: '' });
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const dispatch = useDispatch();

  const handleConnect = async () => {
    setIsConnecting(true);
    const dsn = `${username}:${password}@tcp(${host}:${port})/${dbName}?charset=utf8mb4&parseTime=True&loc=Local`;
    try {
      await ConnectToMySQL(dsn);
      const dbs = await GetDatabases();
      setDatabases(dbs);
      setIsConnected(true);
      setModalContent({
        title: '连接成功',
        message: '已成功连接到 MySQL 数据库。',
        type: 'success'
      });
      let connectionInfo = {
        host,
        port,
        username,
        password,
        dbName,
        id: new Date().getTime()
      }
      handleConnectSuccess(connectionInfo)
      
    } catch (error) {
      console.error('连接失败:', error);
      setModalContent({
        title: '连接失败',
        message: error.message,
        type: 'error'
      });
    } finally {
      setIsConnecting(false);
      setIsModalOpen(true);
    }
  };

  const handleSwitchDatabase = async (connection) => {
    try {
      setUsername(connection.username);
      setPassword(connection.password);
      setHost(connection.host);
      setPort(connection.port);
      setDbName(connection.dbName);
      await ConnectToMySQL(`${connection.username}:${connection.password}@tcp(${connection.host}:${connection.port})/${connection.dbName}?charset=utf8mb4&parseTime=True&loc=Local`);
      const dbs = await GetDatabases();
      setDatabases(dbs);
      setSelectedDb(connection.dbName); // 更新选中的数据库
      setModalContent({
        title: '切换成功',
        message: `成功切换到数据库: ${connection.dbName}`,
        type: 'success'
      });
    } catch (error) {
      console.error('切换数据库失败:', error);
      setModalContent({
        title: '切换失败',
        message: error.message,
        type: 'error'
      });
    } finally {
      setIsModalOpen(true);
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

  const handleConnectSuccess = (connectionInfo) => {
    dispatch(addConnection(connectionInfo));
  };

  const handleSave = async () => {
    try {
      await UpdateTableData(selectedDb, selectedTable, editingRow.id, editingRow);
      setEditingRow(null);
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
      const updatedData = await GetTableData(selectedDb, selectedTable);
      setTableData(updatedData);
    } catch (error) {
      console.error('添加失败:', error);
      alert('添加失败: ' + error.message);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setIsConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await DeleteTableData(selectedDb, selectedTable, deleteId);
      const updatedData = await GetTableData(selectedDb, selectedTable);
      setTableData(updatedData);
      setModalContent({
        title: '删除成功',
        message: '记录已成功删除。',
        type: 'success'
      });
    } catch (error) {
      console.error('删除失败:', error);
      setModalContent({
        title: '删除失败',
        message: error.message,
        type: 'error'
      });
    } finally {
      setIsConfirmDialogOpen(false);
      setIsModalOpen(true);
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
        const sidebarWidth = isSidebarCollapsed ? 60 : 250;
        mainContentRef.current.style.maxWidth = `calc(100vw - ${sidebarWidth + 40}px)`;
      }
    };

    updateMainContentWidth();
    window.addEventListener('resize', updateMainContentWidth);

    return () => window.removeEventListener('resize', updateMainContentWidth);
  }, [isSidebarCollapsed]);

  return (
    <Router>
      <div className="mysql-manager" style={{backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none'}}>
        <Sidebar
          databases={databases}
          selectedDb={selectedDb}
          setSelectedDb={setSelectedDb}
          tables={tables}
          selectedTable={selectedTable}
          setSelectedTable={setSelectedTable}
          isSidebarCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
          isConnected={isConnected}
          handleBackgroundImageChange={handleBackgroundImageChange}
        />
        <div className="main-content" ref={mainContentRef}>
          <Routes>
            <Route path="/connections" element={<ConnectionList onSwitchDatabase={handleSwitchDatabase} />} />
            <Route path="/" element={
              <>
                <ConnectionForm
                  username={username}
                  setUsername={setUsername}
                  password={password}
                  setPassword={setPassword}
                  host={host}
                  setHost={setHost}
                  port={port}
                  setPort={setPort}
                  dbName={dbName}
                  setDbName={setDbName}
                  handleConnect={handleConnect}
                  isConnecting={isConnecting}
                />
                <TableView
                  tableData={tableData}
                  editingRow={editingRow}
                  setEditingRow={setEditingRow}
                  handleSave={handleSave}
                  handleEdit={setEditingRow}
                  handleDelete={handleDelete}
                  newRow={newRow}
                  setNewRow={setNewRow}
                  handleAdd={handleAdd}
                />
                <CustomQuerySection
                  customQuery={customQuery}
                  setCustomQuery={setCustomQuery}
                  handleExecuteQuery={handleExecuteQuery}
                  queryResult={queryResult}
                />
              </>
            } />
          </Routes>
        </div>
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          type={modalContent.type}
        >
          <h2>{modalContent.title}</h2>
          <p>{modalContent.message}</p>
        </Modal>
        <ConfirmDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          onConfirm={confirmDelete}
          message="确定要删除这条记录吗？此操作不可撤销。"
        />
      </div>
    </Router>
  );
};


export default MySQLManager;
