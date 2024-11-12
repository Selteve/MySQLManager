import React, { useState, useEffect } from 'react';
import ConfirmDialog from '../common/ConfirmDialog';
import { deleteConnection, getAllConnections } from '../../utils/dbOperations'; // 假设这是与 SQLite 交互的工具函数

const ConnectionList = () => {
  const [connections, setConnections] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    const data = await getAllConnections();
    setConnections(data);
  };

  const handleDeleteClick = (connection, e) => {
    e.stopPropagation(); // 阻止事件冒泡
    setSelectedConnection(connection);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedConnection) {
      await deleteConnection(selectedConnection.id);
      await loadConnections(); // 重新加载连接列表
      setShowDeleteDialog(false);
      setSelectedConnection(null);
    }
  };

  return (
    <div className="connection-list">
      {/* 连接列表的其他内容 */}
      
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="确认删除"
        message={`确定要删除连接 "${selectedConnection?.name}" 吗？`}
      />
    </div>
  );
};

export default ConnectionList;