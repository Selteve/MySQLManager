import React from 'react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-effect confirm-dialog">
        <h2>确认删除</h2>
        <p>{message}</p>
        <div className="confirm-buttons">
          <button className="cancel-button" onClick={onClose}>取消</button>
          <button className="danger-button" onClick={onConfirm}>删除</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
