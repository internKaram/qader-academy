import { CardBody, CardFooter, CardHeader, CardRoot } from './Card';
export { Badge } from './Badge';
export { Button } from './Button';
export { CardBody, CardFooter, CardHeader, CardRoot } from './Card';
export { Input } from './Input';
export { Modal } from './Modal';
export { Spinner } from './Spinner';
export { Table, type TableColumn } from './Table';

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
