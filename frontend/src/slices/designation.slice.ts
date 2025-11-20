import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { designationService } from '../services/designation.service';
import type { Designation, Department } from '../types/designation.types';

interface DesignationState {
  designationsByDepartment: Record<string, Designation[]>;
  departments: Department[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DesignationState = {
  designationsByDepartment: {},
  departments: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchDesignationsByDepartmentAsync = createAsyncThunk(
  'designation/fetchByDepartment',
  async (department: string, { rejectWithValue }) => {
    try {
      const designations = await designationService.getByDepartment(department);
      return { department, designations };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch designations');
    }
  }
);

export const fetchAllDepartmentsAsync = createAsyncThunk(
  'designation/fetchAllDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const departments = await designationService.getAllTeams();
      return departments;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch departments');
    }
  }
);

const designationSlice = createSlice({
  name: 'designation',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDesignationsForDepartment: (state, action) => {
      delete state.designationsByDepartment[action.payload];
    },
  },
  extraReducers: (builder) => {
    // Fetch designations by department
    builder
      .addCase(fetchDesignationsByDepartmentAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDesignationsByDepartmentAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.designationsByDepartment[action.payload.department] = action.payload.designations;
        state.error = null;
      })
      .addCase(fetchDesignationsByDepartmentAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch all departments
    builder
      .addCase(fetchAllDepartmentsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllDepartmentsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departments = action.payload;
        state.error = null;
      })
      .addCase(fetchAllDepartmentsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearDesignationsForDepartment } = designationSlice.actions;
export default designationSlice.reducer;
