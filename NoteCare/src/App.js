import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contextos/AuthContext';
import { DataProvider } from './contextos/DataContext';
import AppRoutes from './rotas/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
