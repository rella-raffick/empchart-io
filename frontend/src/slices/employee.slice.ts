import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeeService } from '../services/employee.service';
import type { Employee, OrgChartNode, UpdateEmployeeManager, EmployeePath } from '../types/employee.types';

interface EmployeeState {
  employees: Employee[];
  hierarchy: OrgChartNode | null;
  employeePath: EmployeePath[];
  employeeSubtree: OrgChartNode | null;
  selectedEmployee: Employee | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  employees: [],
  hierarchy: null,
  employeePath: [],
  employeeSubtree: null,
  selectedEmployee: null,
  isLoading: false,
  isUpdating: false,
  error: null,
};

// Async thunks
export const fetchEmployeesAsync = createAsyncThunk(
  'employee/fetchAll',
  async (token: string, { rejectWithValue }) => {
    try {
      const employees = await employeeService.getAll(token);
      return employees;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch employees');
    }
  }
);

export const fetchHierarchyAsync = createAsyncThunk(
  'employee/fetchHierarchy',
  async (token: string, { rejectWithValue }) => {
    try {
      const hierarchy = await employeeService.getHierarchy(token);
      return hierarchy;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch hierarchy');
    }
  }
);

export const updateEmployeeManagerAsync = createAsyncThunk(
  'employee/updateManager',
  async (
    { employeeId, managerId, token }: { employeeId: number; managerId: number | null; token: string },
    { rejectWithValue }
  ) => {
    try {
      const data: UpdateEmployeeManager = { managerId };
      const updatedEmployee = await employeeService.updateManager(employeeId, data, token);
      return updatedEmployee;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update manager');
    }
  }
);

export const fetchEmployeeByIdAsync = createAsyncThunk(
  'employee/fetchById',
  async ({ employeeId, token }: { employeeId: number; token: string }, { rejectWithValue }) => {
    try {
      const employee = await employeeService.getById(employeeId, token);
      return employee;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch employee');
    }
  }
);

export const fetchEmployeePathAsync = createAsyncThunk(
  'employee/fetchPath',
  async ({ employeeId, token }: { employeeId: number; token: string }, { rejectWithValue }) => {
    try {
      const path = await employeeService.getEmployeePath(employeeId, token);
      return path;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch employee path');
    }
  }
);

export const fetchEmployeeSubtreeAsync = createAsyncThunk(
  'employee/fetchSubtree',
  async ({ employeeId, token }: { employeeId: number; token: string }, { rejectWithValue }) => {
    try {
      const subtree = await employeeService.getEmployeeSubtree(employeeId, token);
      return subtree;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch employee subtree');
    }
  }
);

export const fetchMyTeamHierarchyAsync = createAsyncThunk(
  'employee/fetchMyTeamHierarchy',
  async ({ employeeId, token }: { employeeId: number; token: string }, { rejectWithValue }) => {
    try {
      // Fetch both path and subtree in parallel
      const [path, subtree] = await Promise.all([
        employeeService.getEmployeePath(employeeId, token),
        employeeService.getEmployeeSubtree(employeeId, token),
      ]);
      return { path, subtree };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch team hierarchy');
    }
  }
);

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedEmployee: (state, action) => {
      state.selectedEmployee = action.payload;
    },
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
    },
    clearTeamHierarchy: (state) => {
      state.employeePath = [];
      state.employeeSubtree = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all employees
    builder
      .addCase(fetchEmployeesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployeesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employees = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployeesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch hierarchy
    builder
      .addCase(fetchHierarchyAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHierarchyAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hierarchy = action.payload;
        state.error = null;
      })
      .addCase(fetchHierarchyAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update employee manager
    builder
      .addCase(updateEmployeeManagerAsync.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateEmployeeManagerAsync.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.error = null;

        // Update the employee in the employees array
        const index = state.employees.findIndex((emp) => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      })
      .addCase(updateEmployeeManagerAsync.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Fetch employee by ID
    builder
      .addCase(fetchEmployeeByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedEmployee = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployeeByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch employee path
    builder
      .addCase(fetchEmployeePathAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployeePathAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employeePath = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployeePathAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch employee subtree
    builder
      .addCase(fetchEmployeeSubtreeAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeSubtreeAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employeeSubtree = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployeeSubtreeAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch my team hierarchy (path + subtree)
    builder
      .addCase(fetchMyTeamHierarchyAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyTeamHierarchyAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employeePath = action.payload.path;
        state.employeeSubtree = action.payload.subtree;
        state.error = null;
      })
      .addCase(fetchMyTeamHierarchyAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedEmployee, clearSelectedEmployee, clearTeamHierarchy } = employeeSlice.actions;
export default employeeSlice.reducer;
