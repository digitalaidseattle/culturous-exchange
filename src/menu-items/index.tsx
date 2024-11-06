// project import
import {
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';

const icons = {
  CalendarOutlined,
  UserOutlined
};

// ==============================|| MENU ITEMS ||============================== //
const dashboard = {
  id: 'group-dashboard',
  title: 'Culturous Exchange',
  type: 'group',
  children: [
    {
      id: 'sessions',
      title: 'Sessions',
      type: 'item',
      url: '/sessions',
      icon: icons.CalendarOutlined,
      breadcrumbs: false
    },
    {
      id: 'students',
      title: 'Students',
      type: 'item',
      url: '/students',
      icon: icons.UserOutlined,
      breadcrumbs: false
    }
  ]
}

const menuItems = {
  items: [dashboard]
};

export default menuItems;
