import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/auth.slice';
import themeReducer from '../slices/theme.slice';
import employeeReducer from '../slices/employee.slice';
import designationReducer from '../slices/designation.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    employee: employeeReducer,
    designation: designationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
