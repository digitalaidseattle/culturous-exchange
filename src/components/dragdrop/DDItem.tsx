import { Card, CardContent } from '@mui/material';
import { DDType } from './types';

type DDItemProps<T extends DDType> = {
  item: T;
};

const DDItem = <T extends DDType,>({ item }: DDItemProps<T>) => {
  return (
    <Card>
      <CardContent>id: {item.id}</CardContent>
    </Card>
  );
};

export default DDItem;