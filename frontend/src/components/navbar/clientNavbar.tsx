'use client';
import { useState, FC, MouseEvent } from 'react';
import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

interface ClientNavbarProps {
  pages: string[];
}

const ClientNavbar: FC<ClientNavbarProps> = ({ pages }) => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleOpenNavMenu}
        color="inherit"
        className="flex md:hidden"
      >
        <MenuIcon />
      </IconButton>
      
      {/* Mobile Menu */}
      <Menu
        id="menu-appbar"
        anchorEl={anchorElNav}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        open={Boolean(anchorElNav)}
        onClose={handleCloseNavMenu}
        className="block md:hidden"
      >
        {pages.map((page) => (
          <MenuItem key={page} onClick={handleCloseNavMenu}>
            <Link href={`/${page.toLowerCase().replace(/ /g, '-')}`} passHref>
              <Typography textAlign="center" className="text-black">
                {page}
              </Typography>
            </Link>
          </MenuItem>
        ))}
      </Menu>

      {/* Desktop Menu */}
      <div className="hidden md:flex space-x-4">
        {pages.map((page) => (
          <Link href={`/${page.toLowerCase().trim().replace(/ /g, '-')}`} key={page} passHref>
            <Typography className="text-white px-4 cursor-pointer">
              {page}
            </Typography>
          </Link>
        ))}
      </div>
    </>
  );
};

export default ClientNavbar;
