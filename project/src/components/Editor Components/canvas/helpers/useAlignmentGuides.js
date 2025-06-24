import { useState, useCallback } from 'react';

// Custom hook for alignment guides (snap guides)
const useAlignmentGuides = (elements, snapThreshold = 8) => {
  const [guides, setGuides] = useState([]);

  // Helper to get width/height from element
  const getDims = (el) => ({
    x: el.position.x,
    y: el.position.y,
    width: el.styles?.width || 100,
    height: el.styles?.height || 30,
  });

  const getAlignmentGuides = useCallback((draggedElement) => {
    const newGuides = [];
    const draggedDims = getDims(draggedElement);
    const otherElements = elements.filter(el => el.id !== draggedElement.id);

    otherElements.forEach(element => {
      const dims = getDims(element);
      // Vertical guides (left, center, right)
      const alignments = [
        { pos: dims.x, type: 'left' },
        { pos: dims.x + dims.width / 2, type: 'center' },
        { pos: dims.x + dims.width, type: 'right' }
      ];
      alignments.forEach(({ pos, type }) => {
        const draggedPositions = [
          draggedDims.x,
          draggedDims.x + draggedDims.width / 2,
          draggedDims.x + draggedDims.width
        ];
        draggedPositions.forEach(dragPos => {
          if (Math.abs(dragPos - pos) < snapThreshold) {
            newGuides.push({ type: 'vertical', x: pos, id: `v-${element.id}-${type}` });
          }
        });
      });
      // Horizontal guides (top, center, bottom)
      const hAlignments = [
        { pos: dims.y, type: 'top' },
        { pos: dims.y + dims.height / 2, type: 'center' },
        { pos: dims.y + dims.height, type: 'bottom' }
      ];
      hAlignments.forEach(({ pos, type }) => {
        const draggedPositions = [
          draggedDims.y,
          draggedDims.y + draggedDims.height / 2,
          draggedDims.y + draggedDims.height
        ];
        draggedPositions.forEach(dragPos => {
          if (Math.abs(dragPos - pos) < snapThreshold) {
            newGuides.push({ type: 'horizontal', y: pos, id: `h-${element.id}-${type}` });
          }
        });
      });
    });
    // Remove duplicates
    const uniqueGuides = newGuides.filter((guide, index, self) =>
      index === self.findIndex(g => g.type === guide.type && (g.x === guide.x || g.y === guide.y))
    );
    setGuides(uniqueGuides);
    return uniqueGuides;
  }, [elements, snapThreshold]);

  const snapToGuides = useCallback((element, currentGuides) => {
    let { x, y } = element.position;
    const width = element.styles?.width || 100;
    const height = element.styles?.height || 30;
    currentGuides.forEach(guide => {
      if (guide.type === 'vertical') {
        if (Math.abs(x - guide.x) < snapThreshold) {
          x = guide.x;
        } else if (Math.abs((x + width / 2) - guide.x) < snapThreshold) {
          x = guide.x - width / 2;
        } else if (Math.abs((x + width) - guide.x) < snapThreshold) {
          x = guide.x - width;
        }
      }
      if (guide.type === 'horizontal') {
        if (Math.abs(y - guide.y) < snapThreshold) {
          y = guide.y;
        } else if (Math.abs((y + height / 2) - guide.y) < snapThreshold) {
          y = guide.y - height / 2;
        } else if (Math.abs((y + height) - guide.y) < snapThreshold) {
          y = guide.y - height;
        }
      }
    });
    return { ...element, position: { ...element.position, x, y } };
  }, [snapThreshold]);

  const clearGuides = useCallback(() => {
    setGuides([]);
  }, []);

  return {
    guides,
    getAlignmentGuides,
    snapToGuides,
    clearGuides
  };
};

export default useAlignmentGuides; 