import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/index';
import ApplicationDetailsPage from './pages/applications/ApplicationDetailsPage';
import ApplicationsPage from './pages/applications/ApplicationsPage';
import NewApplicationPage from './pages/applications/NewApplicationPage';
import AuditLogsPage from './pages/auditLog/AuditLogsPage';
import UsersPage from './pages/users/UsersPage';
import RegistrationPage from './pages/auth/RegistrationPage';

import ProtectedRoute from './routes/protectedRoute';
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<RegistrationPage />} />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            }
          />
          <Route
            path="/applications"
            element={
              <MainLayout>
                <ApplicationsPage />
              </MainLayout>
            }
          />

          <Route
            path="/applications/:id"
            element={
              <MainLayout>
                <ApplicationDetailsPage />
              </MainLayout>
            }
          />
          <Route
            path="/applications/new"
            element={
              <MainLayout>
                <NewApplicationPage />
              </MainLayout>
            }
          />
          <Route
            path="/audit"
            element={
              <MainLayout>
                <AuditLogsPage />
              </MainLayout>
            }
          />
          <Route
            path="/users"
            element={
              <MainLayout>
                <UsersPage />
              </MainLayout>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
