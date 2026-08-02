import { Link } from 'react-router-dom';
import { Button } from './ui';

export function NavSignInButton() {
  return (
    <Link to="/login">
      <Button
        size="sm"
        style={{
          backgroundColor: '#3b635a',
          boxShadow: '0 4px 12px rgba(59, 99, 90, 0.3)',
        }}
      >
        Sign In
      </Button>
    </Link>
  );
}
