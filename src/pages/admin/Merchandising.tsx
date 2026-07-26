import React, { useState, useEffect } from 'react';
import { 
  Settings, Eye, EyeOff, GripVertical, 
  ArrowUp, ArrowDown, RefreshCw, Save,
  LayoutGrid, LayoutList, Palette, Type,
  RotateCcw, Trash2, X
} from 'lucide-react';
import { merchandisingService } from '../../services/merchandisingService';
import { MerchandisingSection } from '../../types/merchandising';
import toast from 'react-hot-toast';

const AdminMerchandising: React.FC = () => {
  const [sections, setSections] = useState<MerchandisingSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<MerchandisingSection | null>(null);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    setLoading(true);
    try {
      const allSections = await merchandisingService.getSections();
      console.log('📋 Loaded sections:', allSections.map(s => ({ id: s.id, enabled: s.enabled })));
      setSections(allSections);
    } catch (error) {
      console.error('Error loading sections:', error);
      toast.error('Failed to load merchandising sections');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      console.log(`🔄 Toggling section: ${id}`);
      const section = sections.find(s => s.id === id);
      if (!section) {
        toast.error('Section not found');
        return;
      }
      const newState = !section.enabled;
      const updated = await merchandisingService.updateSection(id, { enabled: newState });
      if (updated) {
        console.log(`✅ Section ${id} toggled to: ${newState}`);
        toast.success(`${section.title} ${newState ? '✅ Enabled' : '❌ Disabled'}`);
        await loadSections();
      } else {
        toast.error('Failed to toggle section');
      }
    } catch (error) {
      console.error('Error toggling section:', error);
      toast.error('Error toggling section');
    }
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(s => s.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    
    const newSections = [...sections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    newSections.forEach((s, i) => s.displayOrder = i + 1);
    
    // Save the entire config
    try {
      const config = await merchandisingService.getConfig();
      config.sections = newSections;
      await merchandisingService.saveConfig(config);
      setSections(newSections);
      toast.success('Section order updated');
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleSave = async (section: MerchandisingSection) => {
    try {
      console.log(`💾 Saving section: ${section.id}`, section);
      const updated = await merchandisingService.updateSection(section.id, {
        title: section.title,
        subtitle: section.subtitle,
        maxProducts: section.maxProducts,
        layout: section.layout,
        backgroundColor: section.backgroundColor,
        textColor: section.textColor,
      });
      if (updated) {
        await loadSections();
        setEditingSection(null);
        toast.success('Section updated successfully!');
      } else {
        toast.error('Failed to update section');
      }
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error('Error saving section');
    }
  };

  const handleReset = async () => {
    if (window.confirm('⚠️ Reset all sections to default configuration?')) {
      try {
        await merchandisingService.resetToDefault();
        await loadSections();
        toast.success('Reset to default successfully');
      } catch (error) {
        console.error('Error resetting:', error);
        toast.error('Failed to reset');
      }
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      hot_drops: '🔥 Hot Drops',
      new_in: '✨ New In',
      trending: '🌟 Trending',
      seasonal: '☀️ Seasonal',
      bestsellers: '🏆 Bestsellers',
      recommended: '💡 Recommended',
      outfit_inspiration: '👗 Outfit Inspiration',
      get_the_look: '🎯 Get the Look',
      brand_features: '🏷️ Brand Features',
    };
    return labels[type] || type;
  };

  const enabledCount = sections.filter(s => s.enabled).length;
  const totalCount = sections.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              🏷️ Merchandising Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your store sections and their visibility
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 self-center">
              {enabledCount}/{totalCount} enabled
            </span>
            <button
              onClick={loadSections}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 text-gray-700 dark:text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-amber-300 dark:border-amber-700 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition flex items-center gap-2 text-amber-600 dark:text-amber-400"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Defaults
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Sections', value: totalCount, color: 'bg-blue-500' },
            { label: 'Enabled', value: enabledCount, color: 'bg-green-500' },
            { label: 'Disabled', value: totalCount - enabledCount, color: 'bg-gray-500' },
            { label: 'Hot Drops', value: sections.find(s => s.id === 'hot_drops')?.enabled ? 1 : 0, color: 'bg-orange-500' },
            { label: 'New In', value: sections.find(s => s.id === 'new_in')?.enabled ? 1 : 0, color: 'bg-pink-500' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Sections List */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Store Sections
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Toggle visibility, edit details, or reorder sections
            </p>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sections.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No sections found. Click "Reset Defaults" to create default sections.
              </div>
            ) : (
              sections.map((section) => (
                <div key={section.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  {editingSection?.id === section.id ? (
                    // Edit Mode (unchanged)
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={editingSection.title || ''}
                            onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                            className="text-lg font-semibold bg-transparent border-b border-gray-300 dark:border-gray-700 focus:border-pink-500 outline-none w-full dark:text-white"
                          />
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleSave(editingSection)}
                            className="px-3 py-1 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition text-sm flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSection(null)}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Subtitle
                          </label>
                          <input
                            type="text"
                            value={editingSection.subtitle || ''}
                            onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Max Products
                          </label>
                          <input
                            type="number"
                            value={editingSection.maxProducts || 4}
                            onChange={(e) => setEditingSection({ ...editingSection, maxProducts: parseInt(e.target.value) || 4 })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                            min="1"
                            max="12"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Layout
                          </label>
                          <select
                            value={editingSection.layout || 'grid'}
                            onChange={(e) => setEditingSection({ ...editingSection, layout: e.target.value as any })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                          >
                            <option value="grid">Grid</option>
                            <option value="carousel">Carousel</option>
                            <option value="featured">Featured</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Background Color
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={editingSection.backgroundColor || '#ffffff'}
                              onChange={(e) => setEditingSection({ ...editingSection, backgroundColor: e.target.value })}
                              className="w-10 h-10 rounded border border-gray-300 dark:border-gray-700 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={editingSection.backgroundColor || '#ffffff'}
                              onChange={(e) => setEditingSection({ ...editingSection, backgroundColor: e.target.value })}
                              className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none font-mono"
                              placeholder="#fdf2f8"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Display Order
                          </label>
                          <input
                            type="number"
                            value={editingSection.displayOrder || 1}
                            onChange={(e) => setEditingSection({ ...editingSection, displayOrder: parseInt(e.target.value) || 1 })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                            min="1"
                            max={sections.length}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // View Mode (unchanged)
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 cursor-move text-gray-400">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xl">{section.icon || '📦'}</span>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {section.title}
                            </h3>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                              {section.type}
                            </span>
                            {section.backgroundColor && (
                              <span 
                                className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: section.backgroundColor }}
                              />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{section.subtitle}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-xs text-gray-400 px-2">
                          {section.maxProducts || 4} products
                        </span>
                        <span className="text-xs text-gray-400 px-2 capitalize">
                          {section.layout || 'grid'}
                        </span>
                        <span className="text-xs text-gray-400 px-2">
                          #{section.displayOrder}
                        </span>
                        
                        <button
                          onClick={() => setEditingSection(section)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="Edit"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleMove(section.id, 'up')}
                          disabled={section.displayOrder === 1}
                          className="p-1.5 text-gray-400 hover:text-gray-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMove(section.id, 'down')}
                          disabled={section.displayOrder === sections.length}
                          className="p-1.5 text-gray-400 hover:text-gray-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleToggle(section.id)}
                          className={`p-1.5 rounded-lg transition ${
                            section.enabled 
                              ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' 
                              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          title={section.enabled ? 'Disable' : 'Enable'}
                        >
                          {section.enabled ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          section.enabled 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                          {section.enabled ? 'Active' : 'Hidden'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 <strong>Tips:</strong>
            <br />
            • <strong>Toggle</strong> sections on/off to show/hide on the storefront
            <br />
            • <strong>Click</strong> the settings icon ✏️ to edit section details
            <br />
            • <strong>Arrows</strong> ↑↓ move sections up/down
            <br />
            • <strong>Refresh</strong> your storefront after making changes
          </p>
        </div>

        {/* Debug Info */}
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Debug: {sections.length} sections loaded • {enabledCount} enabled • 
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminMerchandising;