// Wails 会自动注入 window.go 对象
export const getAllConnections = async () => {
  try {
    return await window.go.main.GetAllConnections();
  } catch (error) {
    console.error('获取连接列表失败:', error);
    return [];
  }
};

export const deleteConnection = async (id) => {
  try {
    await window.go.main.DeleteConnection(id);
    return true;
  } catch (error) {
    console.error('删除连接失败:', error);
    return false;
  }
};

// 其他数据库操作函数... 