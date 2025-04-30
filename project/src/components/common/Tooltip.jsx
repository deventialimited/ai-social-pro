import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const Tooltip = ({ id, content, children, position = 'top', className = '' }) => {
  return (
    <>
      <div
        data-tooltip-id={id}
        data-tooltip-content={content}
        data-tooltip-place={position}
        className={className}
      >
        {children}
      </div>
      <ReactTooltip
        id={id}
        className="z-50"
        style={{
          backgroundColor: '#4B5563',
          color: 'white',
          padding: '0.5rem',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          maxWidth: '200px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      />
    </>
  );
};

export default Tooltip; 