import React, { useState, useRef, ChangeEvent } from 'react';
import { Edit, Save, X, Upload, Image, Building2 } from 'lucide-react';
import { BusinessData } from '../types';

interface BusinessSectionProps {
  data: BusinessData;
  onEdit: (section: string) => void;
}

export const BusinessSection: React.FC<BusinessSectionProps> = ({ data, onEdit }) => {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState(data);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const headshotInputRef = useRef<HTMLInputElement>(null);
  const colorPickerRefs = {
    brandColor: useRef<HTMLInputElement>(null),
    backgroundColor: useRef<HTMLInputElement>(null),
    textColor: useRef<HTMLInputElement>(null),
  };

  const handleEdit = (section: string) => {
    setEditingSection(section);
    onEdit(section);
  };

  const handleSave = () => {
    setEditingSection(null);
    console.log('Saving data:', formData);
  };

  const handleCancel = () => {
    setEditingSection(null);
    setFormData(data);
  };

  const handleColorClick = (type: 'brandColor' | 'backgroundColor' | 'textColor') => {
    colorPickerRefs[type].current?.click();
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>, type: 'logo' | 'headshot') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a URL for the uploaded file
    const imageUrl = URL.createObjectURL(file);
    
    setFormData(prev => ({
      ...prev,
      [type]: imageUrl,
      ...(type === 'logo' ? { logoBackground: 'white' } : {})
    }));
  };

  const renderImageUpload = (type: 'logo' | 'headshot', inputRef: React.RefObject<HTMLInputElement>) => {
    const isEditing = editingSection === 'brand';
    const imageUrl = type === 'logo' ? '/kaz-routes-logo.png' : formData[type];
    const title = type === 'logo' ? 'Upload Logo' : 'Upload Headshot';

    return (
      <div className="space-y-2">
        <div
          className={`relative group cursor-pointer overflow-hidden rounded-lg
            ${type === 'logo' ? 'w-[100px] h-[100px] bg-white' : 'w-[120px] h-[120px]'}
            ${!imageUrl ? 'border-2 border-dashed border-gray-300 dark:border-gray-600' : ''}`}
          onClick={() => isEditing && inputRef.current?.click()}
        >
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={title}
                className={`w-full h-full ${type === 'logo' ? 'object-contain p-2' : 'object-cover'}`}
              />
              <div className={`absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${!isEditing && 'cursor-not-allowed'}`}>
                <Upload className="w-6 h-6 text-white" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <Image className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">{title}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {type === 'logo' ? '100x100px' : '120x120px'}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileUpload(e, type)}
          className="hidden"
          disabled={!isEditing}
        />
      </div>
    );
  };

  const renderField = (label: string, value: string, field: keyof BusinessData) => {
    const isEditing = editingSection === 'business';

    return (
      <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
        <label className="w-32 text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </label>
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={value}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm"
            />
          ) : (
            <span className="text-sm text-gray-900 dark:text-white">{value}</span>
          )}
        </div>
      </div>
    );
  };

  const renderList = (title: string, items: string[], field: 'audience' | 'audiencePains' | 'coreValues') => {
    const isEditing = editingSection === 'marketing';

    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>
        {isEditing ? (
          <div className="space-y-2">
            {items.map((item, index) => (
              <input
                key={index}
                type="text"
                value={item}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = e.target.value;
                  setFormData({
                    ...formData,
                    marketingStrategy: {
                      ...formData.marketingStrategy,
                      [field]: newItems
                    }
                  });
                }}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm"
              />
            ))}
          </div>
        ) : (
          <ul className="space-y-1">
            {items.map((item, index) => (
              <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const renderColorPicker = () => {
    const isEditing = editingSection === 'brand';

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Select the colors you want to use for your posts.
        </h3>
        <div className="flex gap-4">
          {[
            { type: 'brandColor', label: 'Brand Color' },
            { type: 'backgroundColor', label: 'Background Color' },
            { type: 'textColor', label: 'Text Color' }
          ].map(({ type, label }) => (
            <div key={type} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                  style={{ backgroundColor: formData[type as keyof typeof formData] || '#000000' }}
                  onClick={() => isEditing && handleColorClick(type as any)}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                <input
                  ref={colorPickerRefs[type as keyof typeof colorPickerRefs]}
                  type="color"
                  value={formData[type as keyof typeof formData] as string || '#000000'}
                  onChange={(e) => setFormData({ ...formData, [type]: e.target.value })}
                  className="hidden"
                  disabled={!isEditing}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSection = (title: string, section: string, children: React.ReactNode) => {
    const isEditing = editingSection === section;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
              >
                <Save className="w-5 h-5" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleEdit(section)}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Edit className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="p-4 space-y-4">
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Business Profile
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your business information and branding to ensure consistent messaging across all platforms.
          </p>
        </div>

        <div className="p-8 space-y-6">
          {/* Brand Category */}
          {renderSection('Brand', 'brand', (
            <div className="space-y-6">
              <div className="flex gap-6">
                {renderImageUpload('logo', logoInputRef)}
                {renderImageUpload('headshot', headshotInputRef)}
              </div>
              {renderColorPicker()}
            </div>
          ))}

          {/* Business Category */}
          {renderSection('Business', 'business', (
            <div className="space-y-4">
              {renderField('Business Name', formData.name, 'name')}
              {renderField('Description', formData.description, 'description')}
              {renderField('Industry', formData.industry, 'industry')}
              {renderField('Niche', formData.niche, 'niche')}
              {renderField('Website', formData.website, 'website')}
              {renderField('Language', formData.language, 'language')}
              {renderField('Country', formData.country, 'country')}
              {renderField('State/Region', formData.region, 'region')}
            </div>
          ))}

          {/* Marketing Strategy Category */}
          {renderSection('Marketing Strategy', 'marketing', (
            <div className="space-y-6">
              {renderList('Target Audience', formData.marketingStrategy.audience, 'audience')}
              {renderList('Audience Pains', formData.marketingStrategy.audiencePains, 'audiencePains')}
              {renderList('Core Values', formData.marketingStrategy.coreValues, 'coreValues')}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};