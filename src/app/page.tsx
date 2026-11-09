// Login page served at root — redirects to /dashboard-admin on success
import LoginPageContent from './login/components/LoginPageContent';

export default function RootPage() {
  return <LoginPageContent />;
}