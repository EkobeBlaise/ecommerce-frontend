import api from './api';
import { MerchandisingSection, MerchandisingConfig } from '../types/merchandising';

const defaultConfig: MerchandisingConfig = {
  sections: [
    { id: 'hot_drops', title: '🔥 Hot Drops', subtitle: 'Limited time offers', type: 'hot_drops', icon: '🔥', enabled: true, displayOrder: 1, maxProducts: 4, layout: 'grid' },
    { id: 'new_in', title: '✨ New In', subtitle: 'Latest arrivals', type: 'new_in', icon: '✨', enabled: true, displayOrder: 2, maxProducts: 4, layout: 'grid' },
    { id: 'trending', title: '🌟 Trending Now', subtitle: 'Most popular this week', type: 'trending', icon: '🌟', enabled: true, displayOrder: 3, maxProducts: 4, layout: 'grid', backgroundColor: '#fdf2f8' },
    { id: 'seasonal', title: '☀️ Summer Collection', subtitle: 'Sun-ready styles', type: 'seasonal', icon: '☀️', enabled: true, displayOrder: 4, maxProducts: 4, layout: 'grid' },
    { id: 'bestsellers', title: '🏆 Bestsellers', subtitle: 'Customer favorites', type: 'bestsellers', icon: '🏆', enabled: true, displayOrder: 5, maxProducts: 4, layout: 'grid', backgroundColor: '#f9fafb' },
  ],
  featuredBrands: [],
  featuredCategories: [],
  heroSlides: [],
  stories: [],
  moreBrands: [],
  moreInspiration: [],
};

export const merchandisingService = {
  // Get config from API
  async getConfig(): Promise<MerchandisingConfig> {
    try {
      const res = await api.get('/merchandising');
      return res.data.data;
    } catch (error) {
      console.error('Error fetching config:', error);
      return defaultConfig;
    }
  },

  // Get all sections
  async getSections(): Promise<MerchandisingSection[]> {
    const config = await this.getConfig();
    return config.sections || [];
  },

  // Get enabled sections
  async getEnabledSections(): Promise<MerchandisingSection[]> {
    const sections = await this.getSections();
    return sections.filter(s => s.enabled).sort((a, b) => a.displayOrder - b.displayOrder);
  },

  // Update section
  async updateSection(id: string, updates: Partial<MerchandisingSection>): Promise<MerchandisingSection | null> {
    try {
      const config = await this.getConfig();
      const index = config.sections.findIndex(s => s.id === id);
      if (index === -1) return null;
      config.sections[index] = { ...config.sections[index], ...updates, updatedAt: new Date() };
      const saved = await this.saveConfig(config);
      return saved.sections[index];
    } catch (error) {
      console.error('Error updating section:', error);
      return null;
    }
  },

  // Toggle section visibility
  async toggleSection(id: string): Promise<boolean> {
    const sections = await this.getSections();
    const section = sections.find(s => s.id === id);
    if (!section) return false;
    const updated = await this.updateSection(id, { enabled: !section.enabled });
    return !!updated;
  },

  // Save full config
  async saveConfig(config: MerchandisingConfig): Promise<MerchandisingConfig> {
    const res = await api.put('/merchandising', config);
    return res.data.data;
  },

  // Reset to default
  async resetToDefault(): Promise<MerchandisingConfig> {
    const res = await api.post('/merchandising/reset');
    return res.data.data;
  },
};

export default merchandisingService;