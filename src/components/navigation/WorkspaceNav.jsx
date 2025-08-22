import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const NavContainer = styled.nav`
  background: white;
  box-shadow: ${theme.shadows.small};
  padding: ${theme.spacing.md};
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${theme.colors.primary};
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    display: none;
  }
`;

const NavLink = styled.a`
  color: ${theme.colors.text};
  text-decoration: none;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: 4px;
  transition: ${theme.transitions.default};
  
  &:hover, &.active {
    background: ${theme.colors.primary}15;
    color: ${theme.colors.primary};
  }
`;

const UserMenu = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${theme.colors.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const WorkspaceNav = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  return (
    <NavContainer>
      <NavContent>
        <Logo>SSELFIE Studio</Logo>
        
        <NavLinks>
          <NavLink href="/train" className="active">TRAIN</NavLink>
          <NavLink href="/style">STYLE</NavLink>
          <NavLink href="/shoot">SHOOT</NavLink>
          <NavLink href="/build">BUILD</NavLink>
          <NavLink href="/manage">MANAGE</NavLink>
        </NavLinks>
        
        <UserMenu onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
          <UserAvatar>S</UserAvatar>
          {isUserMenuOpen && (
            <div className="user-menu-dropdown">
              <a href="/profile">Profile</a>
              <a href="/settings">Settings</a>
              <a href="/logout">Logout</a>
            </div>
          )}
        </UserMenu>
      </NavContent>
    </NavContainer>
  );
};

export default WorkspaceNav;