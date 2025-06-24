import React from 'react';

const AlignmentGuides = ({ guides, containerWidth = '100%', containerHeight = '100%' }) => (
  <>
    {guides.map(guide => (
      <div
        key={guide.id}
        className="absolute pointer-events-none z-50"
        style={{
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
  </>
);

export default AlignmentGuides; 