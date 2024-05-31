'use client';
import { useState, FC, MouseEvent } from 'react';
import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { logout } from '@/actions';

interface UserMenuProps {
  settings: string[];
}

const UserMenu: FC<UserMenuProps> = ({ settings }) => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    await logout();
    handleCloseUserMenu();
  };

  return (
    <>
      <Tooltip title="Open settings">
        <IconButton onClick={handleOpenUserMenu} className="p-0">
        <Avatar alt="Remy Sharp" src="https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png" /> {/* please put user icon here*/}
        </IconButton>
      </Tooltip>
      <Menu
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
        className="mt-10 "
      >
        {settings.map((setting) => (
          <MenuItem
            key={setting}
            onClick={setting === 'Logout' ? handleLogout : handleCloseUserMenu}
          >
            {setting === 'Logout' ? (
              <Typography textAlign="center" className="text-black">
                {setting}
              </Typography>
            ) : (
              <Link href={`/${setting.toLowerCase()}`} passHref>
                <Typography textAlign="center" className="text-black">
                  {setting}
                </Typography>
              </Link>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default UserMenu;
