import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import radioReducer from "./radioSlice";
import musicBoxReducer from "./musicBoxSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    radio: radioReducer,
    musicBox: musicBoxReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
