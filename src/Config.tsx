
import {
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';

import logo from "./assets/images/culturous.jpg";

import { MenuItem } from "@digitalaidseattle/mui";

const pages = {
  id: 'main',
  type: 'group',
  children: [
    {
      id: 'cohorts',
      title: 'Cohorts',
      type: 'item',
      url: '/cohorts',
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
  appName: 'Culturous Exchange',
  logoUrl: logo,
  drawerWidth: 240,
  menuItems: [pages],
  toolbarItems: []
}
