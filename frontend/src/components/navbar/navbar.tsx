// components/ResponsiveAppBar.tsx
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import AdbIcon from '@mui/icons-material/Adb';
import ClientNavbar from './clientNavbar';
import UserMenu from './userMenu';
import Link from 'next/link';

const pages = ['About', 'Rules', 'Cards Collection'];
const settings = ['Profile', 'Logout'];


const ResponsiveAppBar = () => {
  return (
    <AppBar position="static" className="bg-blue-500">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Link href = '/' legacyBehavior passHref>
            <a>
        <img src="/logo.jpg" alt="Celestial Narrative Logo" style={{ width: 50, height: 50 }} />
          
          </a>
          </Link>

          <div className="flex-grow-1 flex md:flex">
            <ClientNavbar pages={pages} />
          </div>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#"
            className="mr-2 flex md:hidden flex-grow font-mono font-bold tracking-widest text-white no-underline"
          >
            C-Narrative
          </Typography>

          <div className="flex-grow-0 ml-auto">
            <UserMenu settings={settings} />
          </div>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default ResponsiveAppBar;
