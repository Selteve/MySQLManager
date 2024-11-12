import React from 'react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, message, title = "确认" }) => {
  if (!isOpen) return null;

  const handleConfirm = (e) => {
    e.stopPropagation(); // 阻止事件冒泡
    onConfirm();
  };

  const handleClose = (e) => {
    e.stopPropagation(); // 阻止事件冒泡
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content glass-effect confirm-dialog" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="confirm-buttons">
          <button className="cancel-button" onClick={handleClose}>取消</button>
          <button className="danger-button" onClick={handleConfirm}>删除</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
