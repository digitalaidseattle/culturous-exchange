
import {
  CalendarOutlined,
  HomeOutlined,
  SmileOutlined,
  UserOutlined
} from '@ant-design/icons';

import logo from "./assets/images/culturous.jpg";
import { UI_STRINGS } from './constants';
import { MenuItem } from "@digitalaidseattle/mui";
import packageJson from '../package.json';

const home = {
  id: 'home',
  type: 'group',
  children: [
    {
      id: 'home',
      title: UI_STRINGS.HOME,
      type: 'item',
      url: '/home',
      icon: <HomeOutlined />
    } as MenuItem
  ]
} as MenuItem;

const entities = {
  id: 'data',
  type: 'group',
  children: [
    {
      id: 'cohorts',
      title: UI_STRINGS.COHORTS,
      type: 'item',
      url: '/cohorts',
      icon: <CalendarOutlined />
    } as MenuItem,
    {
      id: 'students',
      title: UI_STRINGS.STUDENTS_LABEL,
      type: 'item',
      url: '/students',
      icon: <UserOutlined />
    } as MenuItem,
    {
      id: 'facilitators',
      title: 'Facilitators',
      type: 'item',
      url: '/facilitators',
      icon: <SmileOutlined />
    } as MenuItem
  ]
} as MenuItem;

export const Config = {
  appName: UI_STRINGS.APP_NAME,
  logoUrl: logo,
  drawerWidth: 240,
  menuItems: [home, entities],
  toolbarItems: [],
  authProviders: ["google"],
  version: packageJson.version
}
