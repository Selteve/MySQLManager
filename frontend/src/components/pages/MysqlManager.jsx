import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import ConnectionForm from '../layout/ConnectionForm';
import TableView from './TableView';
import CustomQuerySection from '../common/CustomQuerySection';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import ConnectionList from './ConnectionList';
import useDatabaseConnection from '../../hooks/useDatabaseConnection';
import '../styles/index.css';

const MySQLManager = () => {
  const {
    username, setUsername,
    password, setPassword,
    host, setHost,
    port, setPort,
    dbName, setDbName,
    databases, setDatabases,
    selectedDb, setSelectedDb,
    tables, setTables,
    selectedTable, setSelectedTable,
    tableData, setTableData,
    isConnected, setIsConnected,
    isConnecting, setIsConnecting,
    modalContent,
    isModalOpen,
    setIsModalOpen,
    handleConnect,
    handleSwitchDatabase
  } = useDatabaseConnection();

  const [editingRow, setEditingRow] = useState(null);
  const [newRow, setNewRow] = useState({});
  const [customQuery, setCustomQuery] = useState('');
  const [queryResult, setQueryResult] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');
  const mainContentRef = useRef(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [connections, setConnections] = useState([]);


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
            <Route path="/connections" element={<ConnectionList onSwitchDatabase={handleSwitchDatabase} connections={connections} setConnections={setConnections} />} />
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
