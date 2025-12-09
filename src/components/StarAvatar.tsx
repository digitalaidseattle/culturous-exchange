import React from 'react';
import { StarFilled, StarOutlined } from '@ant-design/icons';

interface StarAvatarProps {
  active: boolean;
  loading: boolean;
  onToggle: (state: boolean) => void;
}

const StarAvatar: React.FC<StarAvatarProps> = ({ active, loading, onToggle }) => (
  
  <div    
    onClick={(e) => { 
      e.stopPropagation(); 
      onToggle(!active); 
    }}
    style={{
    pointerEvents: loading ? "none" : "auto", // disables click
    opacity: loading ? 0.5 : 1, // visually indicate disabled
    cursor: loading ? "not-allowed" : "pointer",
  }}
    title={active ? 'Deactivate plan' : 'Activate plan'}
  >
    {active ? (
      <StarFilled style={{ margin: 0, fontSize: '150%', color: 'green' }} />
    ) : (
      <StarOutlined style={{ margin: 0, fontSize: '150%', color: 'gray' }}/>
    )}
  </div>
);

export default StarAvatar;
