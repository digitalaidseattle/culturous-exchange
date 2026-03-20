import React, { useContext } from 'react';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import { LoadingContext } from '@digitalaidseattle/core';

interface StarAvatarProps {
  title: string;
  active: boolean;
  onToggle: (state: boolean) => void;
}

const StarAvatar: React.FC<StarAvatarProps> = ({ title, active, onToggle }) => {
  const { loading } = useContext(LoadingContext);

  return <div
    onClick={(e) => {
      e.stopPropagation();
      onToggle(!active);
    }}
    style={{
      pointerEvents: loading ? "none" : "auto", // disables click
      opacity: loading ? 0.5 : 1, // visually indicate disabled
      cursor: loading ? "not-allowed" : "pointer",
    }}
    title={title}
  >
    {active ? (
      <StarFilled style={{ margin: 0, fontSize: '150%', color: 'green' }} />
    ) : (
      <StarOutlined style={{ margin: 0, fontSize: '150%', color: 'gray' }} />
    )}
  </div>
};

export default StarAvatar;
