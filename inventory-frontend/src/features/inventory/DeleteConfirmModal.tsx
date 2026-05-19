"use client";

import { useState } from "react";
import "../../styles/modal.css";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  itemName: string;
}

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName }: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ color: 'var(--danger)' }}>Confirm Deletion</h3>
          <button className="modal-close" onClick={onClose} type="button" disabled={isDeleting}>&times;</button>
        </div>
        
        <p style={{ margin: '1rem 0 2rem', color: 'var(--text-muted)' }}>
          Are you sure you want to delete <strong>{itemName}</strong>? This action is permanent and cannot be undone.
        </p>
        
        <div className="flex justify-between">
          <button className="btn btn-outline" onClick={onClose} disabled={isDeleting}>Cancel</button>
          <button className="btn btn-danger" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? <span className="spinner" style={{ width: '16px', height: '16px', borderLeftColor: '#fff' }}></span> : "Delete Item"}
          </button>
        </div>
      </div>
    </div>
  );
}
