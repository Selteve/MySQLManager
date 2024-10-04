import React from 'react';

const TableView = ({ 
  tableData, 
  editingRow, 
  setEditingRow, 
  handleSave, 
  handleEdit, 
  handleDelete, 
  newRow, 
  setNewRow, 
  handleAdd 
}) => {
  if (!tableData.length) return null;

  return (
    <div className="table-container glass-effect">
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
          {tableData.map(row => (
            <tr key={row.id}>
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
    </div>
  );
};

export default TableView;
