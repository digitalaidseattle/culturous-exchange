
import {
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';

import logo from "./assets/images/culturous.jpg";

import { MenuItem } from "@digitalaidseattle/mui";

const pages = {
  id: 'main',
  title: 'Culturous Exchange',
  type: 'group',
  children: [
    {
      id: 'sessions',
      title: 'Sessions',
      type: 'item',
      url: '/sessions',
      icon: <CalendarOutlined />
    } as MenuItem,
    {
      id: 'students',
      title: 'Students',
      type: 'item',
      url: '/students',
      icon: <UserOutlined />
    } as MenuItem
  ]
} as MenuItem;

export const Config = {
  appName: 'DAS',
  logoUrl: logo,
  drawerWidth: 240,
  menuItems: [pages],
  toolbarItems: []
}
