import { useSelector } from 'react-redux';
import type { RootState } from '../store/store.config';

export const useAppSelector = <TSelected>(
  selector: (state: RootState) => TSelected
): TSelected => useSelector(selector);
