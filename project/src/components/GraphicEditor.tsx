import React, { useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Upload, Image, Type, Layers, Grid, Move, Square, Circle, Star, Triangle, Pentagon, Hexagon, Flag, Plus, Cloud, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Undo, Redo, Droplet, Coffee as Effects, Maximize, Copy, Trash2 } from 'lucide-react';
import { Post, CanvasElement, CanvasData, PLATFORM_DIMENSIONS, SocialPlatform } from '../types';

interface GraphicEditorProps {
  post: Post;
  onClose: () => void;
  onSave: (updatedPost: Post) => void;
}

export const GraphicEditor: React.FC<GraphicEditorProps> = ({ post, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'images' | 'elements' | 'background' | 'layers' | 'size'>('text');
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);
  const [platform, setPlatform] = useState<SocialPlatform>('facebook');
  const [zoom, setZoom] = useState(100);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [canvasData, setCanvasData] = useState<CanvasData>({
    width: PLATFORM_DIMENSIONS[platform].width,
    height: PLATFORM_DIMENSIONS[platform].height,
    background: '#ffffff',
    elements: []
  });

  const handlePlatformChange = (newPlatform: SocialPlatform) => {
    setPlatform(newPlatform);
    setCanvasData(prev => ({
      ...prev,
      width: PLATFORM_DIMENSIONS[newPlatform].width,
      height: PLATFORM_DIMENSIONS[newPlatform].height
    }));
  };

  const renderTextPanel = () => (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Text</h3>
      <button className="w-full px-4 py-2 text-left bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
        Add Heading
      </button>
      <button className="w-full px-4 py-2 text-left bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
        Add Subheading
      </button>
      <button className="w-full px-4 py-2 text-left bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
        Add Body Text
      </button>
    </div>
  );

  const renderShapesPanel = () => (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Shapes</h3>
      <div className="grid grid-cols-4 gap-2">
        <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
          <Square className="w-6 h-6" />
        </button>
        <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
          <Circle className="w-6 h-6" />
        </button>
        <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
          <Star className="w-6 h-6" />
        </button>
        <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
          <Triangle className="w-6 h-6" />
        </button>
        <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
          <Pentagon className="w-6 h-6" />
        </button>
        <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
          <Hexagon className="w-6 h-6" />
        </button>
        <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
          <Flag className="w-6 h-6" />
        </button>
        <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
          <Plus className="w-6 h-6" />
        </button>
        <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
          <Cloud className="w-6 h-6" />
        </button>
        <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
          <ArrowRight className="w-6 h-6" />
        </button>
        <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
          <ArrowUp className="w-6 h-6" />
        </button>
      </div>
    </div>
  );

  const renderBackgroundPanel = () => (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Colors</h3>
        <div className="grid grid-cols-5 gap-2">
          {['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9FA8DA', '#80DEEA', '#FFE082', '#BCAAA4'].map((color) => (
            <button
              key={color}
              className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-600"
              style={{ backgroundColor: color }}
              onClick={() => setCanvasData(prev => ({ ...prev, background: color }))}
            />
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Patterns</h3>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <button
              key={i}
              className="aspect-video bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg"
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderLayersPanel = () => (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Layers</h3>
      <div className="space-y-2">
        {canvasData.elements.map((element, index) => (
          <div
            key={element.id}
            className={`flex items-center justify-between p-2 rounded ${
              selectedElement?.id === element.id
                ? 'bg-blue-50 dark:bg-blue-900/20'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {element.type === 'text' ? (
                <Type className="w-4 h-4" />
              ) : element.type === 'image' ? (
                <Image className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span className="text-sm">{element.type} {index + 1}</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                <ArrowUp className="w-4 h-4" />
              </button>
              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                <ArrowDown className="w-4 h-4" />
              </button>
              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSizePanel = () => (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Canvas Size</h3>
      <div className="space-y-2">
        {(Object.keys(PLATFORM_DIMENSIONS) as SocialPlatform[]).map((key) => (
          <button
            key={key}
            onClick={() => handlePlatformChange(key)}
            className={`w-full p-3 text-left rounded-lg flex items-center justify-between ${
              platform === key
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <span>{PLATFORM_DIMENSIONS[key].label}</span>
            <span className="text-sm text-gray-500">
              {PLATFORM_DIMENSIONS[key].width} x {PLATFORM_DIMENSIONS[key].height}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderToolbar = () => (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1">
      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
        <Undo className="w-4 h-4" />
      </button>
      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
        <Redo className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
        <Copy className="w-4 h-4" />
      </button>
      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
        <Droplet className="w-4 h-4" />
      </button>
      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
        <Effects className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
        <Maximize className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex">
      {/* Left Sidebar - Tools */}
      <div className="w-16 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 gap-4">
        <button
          onClick={() => setActiveTab('text')}
          className={`p-3 rounded-lg ${activeTab === 'text' ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          <Type className="w-5 h-5" />
        </button>
        <button
          onClick={() => setActiveTab('images')}
          className={`p-3 rounded-lg ${activeTab === 'images' ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          <Image className="w-5 h-5" />
        </button>
        <button
          onClick={() => setActiveTab('elements')}
          className={`p-3 rounded-lg ${activeTab === 'elements' ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          <Grid className="w-5 h-5" />
        </button>
        <button
          onClick={() => setActiveTab('background')}
          className={`p-3 rounded-lg ${activeTab === 'background' ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          <Move className="w-5 h-5" />
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`p-3 rounded-lg ${activeTab === 'layers' ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          <Layers className="w-5 h-5" />
        </button>
        <button
          onClick={() => setActiveTab('size')}
          className={`p-3 rounded-lg ${activeTab === 'size' ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          <Maximize className="w-5 h-5" />
        </button>
      </div>

      {/* Left Panel - Options */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        {activeTab === 'text' && renderTextPanel()}
        {activeTab === 'elements' && renderShapesPanel()}
        {activeTab === 'background' && renderBackgroundPanel()}
        {activeTab === 'layers' && renderLayersPanel()}
        {activeTab === 'size' && renderSizePanel()}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Edit
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(post)}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
            >
              Save and Close
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800 relative">
          {renderToolbar()}
          <div
            ref={canvasRef}
            className="relative bg-white shadow-lg"
            style={{
              width: canvasData.width * (zoom / 100),
              height: canvasData.height * (zoom / 100),
              backgroundColor: canvasData.background
            }}
          >
            {/* Canvas elements will be rendered here */}
            <img
              src={post.imageUrl}
              alt="Canvas"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="h-16 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setZoom(Math.max(25, zoom - 25))}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};