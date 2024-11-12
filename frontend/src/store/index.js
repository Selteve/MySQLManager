import { configureStore } from "@reduxjs/toolkit";
import connectionListReducer from "./modules/ConnectionList";

const store = configureStore({
  reducer: {
    connectionList: connectionListReducer
  }
});

export default store;
