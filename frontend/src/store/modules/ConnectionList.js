import { createSlice } from "@reduxjs/toolkit";

// 创建连接列表的Slice
const connectionListSlice = createSlice({
  name: 'connectionList',
  initialState: [],
  reducers: {
    addConnection: (state, action) => {
      state.push(action.payload);
    },
    removeConnection: (state, action) => {
      return state.filter(connection => connection.id !== action.payload);
    }
  }
});

export const { addConnection, removeConnection } = connectionListSlice.actions;
export default connectionListSlice.reducer;
