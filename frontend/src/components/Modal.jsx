import React from 'react';

const Modal = ({ isOpen, onClose, children, type }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal-content glass-effect ${type}`}>
        {children}
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default Modal;
