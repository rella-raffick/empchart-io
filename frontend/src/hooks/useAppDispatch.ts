import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store/store.config';

export const useAppDispatch = () => useDispatch<AppDispatch>();
