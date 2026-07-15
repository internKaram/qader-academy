import { HomePage } from './pages/HomePage';
import { StyleGuidePage } from './pages/StyleGuidePage';

function App() {
  const pathname = window.location.pathname;

  // Full React Router integration belongs to the later routing phase.
  if (pathname === '/style-guide') {
    return <StyleGuidePage />;
  }

  return <HomePage />;
}

export default App;
