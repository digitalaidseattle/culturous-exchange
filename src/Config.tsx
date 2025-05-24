
import {
  CalendarOutlined,
  HomeOutlined,
  UserOutlined
} from '@ant-design/icons';

import logo from "./assets/images/culturous.jpg";

import { MenuItem } from "@digitalaidseattle/mui";
import packageJson from "../package.json";


const home = {
  id: 'home',
  type: 'group',
  children: [
    {
      id: 'home',
      title: 'Home',
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
  menuItems: [home, entities],
  toolbarItems: [],
  authProviders: ["google"],
  version: packageJson.version,
}
