'use client';

import React from 'react';
import { useUser } from '../hooks/useUser';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ size = 'md' }) => {
  const { initials } = useUser();
  
  return (
    <div className={`${sizeClasses[size]} bg-white rounded-full flex items-center justify-center overflow-hidden`}>
      <span className="text-black font-semibold">
        {initials || 'U'}
      </span>
    </div>
  );
};
