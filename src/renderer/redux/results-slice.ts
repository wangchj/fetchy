import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RequestResult } from 'types/request-result';

interface ResultsState {
  [id: string]: RequestResult;
}

const initialState = {} as ResultsState;

export const resultsSlice = createSlice({
  name: 'results',
  initialState,
  reducers: {
    /**
     * Sets the result of a request with specific request id.
     *
     * @param state The state that contains all results.
     * @param action Contains the request id and the result of the request to be added.
     */
    setResult(state, action: PayloadAction<{id: string, result: RequestResult}>) {
      state[action.payload.id] = action.payload.result;
    },
  },
});

export default resultsSlice.reducer