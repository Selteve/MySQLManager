import { useState, useEffect, useCallback } from 'react';
import { ConnectToMySQL, GetDatabases, GetTables, GetTableData, UpdateTableData, InsertTableData, DeleteTableData, ExecuteQuery } from '../../wailsjs/go/main/App';

const useDatabaseConnection = (initialConnections = []) => {
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
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: '' });

  const [connections, setConnections] = useState(initialConnections);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [message, setMessage] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

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
      setIsModalOpen(true);
    } catch (error) {
      console.error('连接失败:', error);
      setModalContent({
        title: '连接失败',
        message: error.message,
        type: 'error'
      });
      setIsModalOpen(true);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSwitchDatabase = useCallback(async (connection, onSwitchDatabase) => {
    try {
      setUsername(connection.username);
      setPassword(connection.password);
      setHost(connection.host);
      setPort(connection.port);
      setDbName(connection.dbName);
      
      const dsn = `${connection.username}:${connection.password}@tcp(${connection.host}:${connection.port})/${connection.dbName}?charset=utf8mb4&parseTime=True&loc=Local`;
      await ConnectToMySQL(dsn);
      
      const dbs = await GetDatabases();
      setDatabases(dbs);
      setSelectedDb(connection.dbName);
      setIsConnected(true);
      
      if (onSwitchDatabase) {
        onSwitchDatabase(connection);
      }

      setMessage('成功切换到数据库: ' + connection.dbName);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('切换数据库失败:', error);
      setMessage('切换失败: ' + error.message);
    }
  }, []);

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

  const handleDelete = useCallback(async (id) => {
    try {
      setConnections(prev => prev.filter(conn => conn.id !== id));
      setMessage('连接已删除');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('删除连接失败:', error);
      setMessage('删除连接失败: ' + error.message);
    }
  }, []);

  const handleTableSave = async (dbName, tableName, row) => {
    try {
      await UpdateTableData(dbName, tableName, row.id, row);
      const updatedData = await GetTableData(dbName, tableName);
      setTableData(updatedData);
    } catch (error) {
      throw error;
    }
  };

  const handleTableAdd = async (dbName, tableName, row) => {
    try {
      await InsertTableData(dbName, tableName, row);
      const updatedData = await GetTableData(dbName, tableName);
      setTableData(updatedData);
    } catch (error) {
      throw error;
    }
  };

  const handleTableDelete = async (dbName, tableName, id) => {
    try {
      await DeleteTableData(dbName, tableName, id);
      const updatedData = await GetTableData(dbName, tableName);
      setTableData(updatedData);
    } catch (error) {
      throw error;
    }
  };

  const handleQueryExecute = async (dbName, query) => {
    try {
      return await ExecuteQuery(dbName, query);
    } catch (error) {
      throw error;
    }
  };

  return {
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
    modalContent, setModalContent,
    isModalOpen, setIsModalOpen,
    handleConnect,
    handleSwitchDatabase,
    connections,
    setConnections,
    hoveredIndex,
    setHoveredIndex,
    message,
    setMessage,
    handleDelete,
    handleTableSave,
    handleTableAdd,
    handleTableDelete,
    handleQueryExecute,
  };
};

export default useDatabaseConnection;