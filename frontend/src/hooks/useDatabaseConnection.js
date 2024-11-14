import { useState, useEffect, useCallback } from 'react';
import { ConnectToMySQL, GetDatabases, GetTables, GetTableData, UpdateTableData, InsertTableData, DeleteTableData, ExecuteQuery, AddConnection, DeleteConnection, GetConnections } from '../../wailsjs/go/main/App';

const useDatabaseConnection = () => {
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

  const [connections, setConnections] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [message, setMessage] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadSavedConnections();
  }, []);

  const loadSavedConnections = async () => {
    try {
      const savedConnections = await GetConnections();
      setConnections(savedConnections || []);
    } catch (error) {
      console.error('加载保存的连接失败:', error);
      setConnections([]);
    }
  };

  const isConnectionExists = (newConnection) => {
    if (!connections || connections.length === 0) return false;
    
    return connections.some(conn => 
      conn.host === newConnection.host && 
      conn.port === newConnection.port &&
      conn.dbName === newConnection.dbName
    );
  };

  const handleConnect = async (connectionInfo) => {
    if (!connectionInfo) return;
    
    const { username, password, host, port } = connectionInfo;
    
    if (!username || !password || !host || !port) {
      setModalContent({
        title: '输入错误',
        message: '请填写用户名、密码、主机和端口',
        type: 'error'
      });
      setIsModalOpen(true);
      return;
    }

    setIsConnecting(true);
    try {
      if (isConnectionExists(connectionInfo)) {
        setModalContent({
          title: '提示',
          message: '该连接已经在列表中。',
          type: 'info'
        });
        setIsModalOpen(true);
        return;
      }

      const dsn = `${username}:${password}@tcp(${host}:${port})/mysql?charset=utf8mb4&parseTime=True&loc=Local`;
      
      await ConnectToMySQL(dsn);
      
      const dbs = await GetDatabases();
      setDatabases(dbs);
      setIsConnected(true);

      await AddConnection(username, password, host, port);
      await loadSavedConnections();

      setModalContent({
        title: '连接成功',
        message: '已成功连接到 MySQL 服务器，请在左侧选择要使用的数据库',
        type: 'success'
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error('连接失败:', error);
      let errorMessage = '';
      let errorType = 'error';

      const errorMsg = error?.message || '未知错误';
      
      if (errorMsg.includes('Access denied')) {
        errorMessage = '用户名或密码错误';
      } else if (errorMsg.includes('connection refused')) {
        errorMessage = '无法连接到数据库服务器，请检查主机和端口是否正确';
      } else {
        errorMessage = errorMsg;
      }

      setModalContent({
        title: '连接失败',
        message: errorMessage,
        type: errorType
      });
      setIsModalOpen(true);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSwitchDatabase = useCallback(async (connection, onSwitchDatabase) => {
    try {
      const savedConnections = await GetConnections();
      const savedConnection = savedConnections.find(conn => conn.id === connection.id);
      
      if (!savedConnection) {
        throw new Error('找不到保存的连接信息');
      }

      setUsername(savedConnection.username);
      setPassword(savedConnection.password);
      setHost(savedConnection.host);
      setPort(savedConnection.port);
      setSelectedDb('');
      setTables([]);
      setSelectedTable('');
      setTableData([]);
      
      const dsn = `${savedConnection.username}:${savedConnection.password}@tcp(${savedConnection.host}:${savedConnection.port})/mysql?charset=utf8mb4&parseTime=True&loc=Local`;
      
      await ConnectToMySQL(dsn);
      const dbs = await GetDatabases();
      setDatabases(dbs);
      setIsConnected(true);
      
      if (onSwitchDatabase) {
        onSwitchDatabase(savedConnection);
      }
      
      setModalContent({
        title: '连接成功',
        message: '已成功连接到服务器，请选择数据库',
        type: 'success'
      });
      setIsModalOpen(true);
      
    } catch (error) {
      console.error('切换数据库失败:', error);
      setModalContent({
        title: '切换失败',
        message: error.message,
        type: 'error'
      });
      setIsModalOpen(true);
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

  const handleDelete = async (id) => {
    try {
      await DeleteConnection(id);
      await loadSavedConnections();
      setMessage('连接已删除');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('删除连接失败:', error);
      setMessage('删除连接失败: ' + error.message);
    }
  };

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