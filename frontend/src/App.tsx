import { HomePage } from './pages/HomePage';
import { StyleGuidePage } from './pages/StyleGuidePage';
import CertificatesPage from './pages/CertificatesPage';

function App() {
  const pathname = window.location.pathname;

  // Temporary path-based routing until React Router is added.
  if (pathname === '/style-guide') {
    return <StyleGuidePage />;
  }

  if (pathname === '/certificates') {
    return <CertificatesPage />;
  }

  return <HomePage />;
}

export default App;
