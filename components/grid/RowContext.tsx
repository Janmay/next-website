import React from 'react';

export interface RowContextState {
  gutter?: number;
}

const RowContext: React.Context<RowContextState> = React.createContext({});

export default RowContext;
