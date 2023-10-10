import * as React from 'react';
import { Container } from '@mui/material';
import Paper from '@mui/material/Paper';

export const AuthContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Container fixed sx={{ mt:'150px', width: 800, height: 400, maxWidth: '100%'}}>
      <Paper>
        {children}
      </Paper>
    </Container>
  );
};
