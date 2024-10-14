import { createSlice } from "@reduxjs/toolkit";

// 创建连接列表的Slice
const connectionListSlice = createSlice({
  name: 'connectionList',
  initialState: [],
  reducers: {
    addConnection: (state, action) => {
      const exists = state.some(connection => 
        connection.host === action.payload.host &&
        connection.port === action.payload.port &&
        connection.username === action.payload.username &&
        connection.dbName === action.payload.dbName
      );
      if (!exists) {
        state.push(action.payload);
      } else {
        console.warn('连接已存在，不需要重复添加');
      }
    },
    removeConnection: (state, action) => {
      return state.filter(connection => connection.id !== action.payload);
    }
  }
});

export const { addConnection, removeConnection } = connectionListSlice.actions;
export default connectionListSlice.reducer;
