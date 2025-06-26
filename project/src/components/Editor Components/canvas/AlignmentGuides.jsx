import React from 'react';

const AlignmentGuides = ({ guides, containerWidth = '100%', containerHeight = '100%' }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: containerWidth,
      height: containerHeight,
      pointerEvents: 'none',
      zIndex: 50,
    }}
  >
    {guides.map(guide => (
      <div
        key={guide.id}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          zIndex: 50,
          ...(guide.type === 'vertical'
            ? {
                left: guide.x,
                top: 0,
                width: '1px',
                height: containerHeight,
                backgroundColor: '#3b82f6',
                borderLeft: '1px dashed #3b82f6',
              }
            : {
                left: 0,
                top: guide.y,
                width: containerWidth,
                height: '1px',
                backgroundColor: '#3b82f6',
                borderTop: '1px dashed #3b82f6',
              }
          )
        }}
      />
    ))}
  </div>
);

export default AlignmentGuides; 