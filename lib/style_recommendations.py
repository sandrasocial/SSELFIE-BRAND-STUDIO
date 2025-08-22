import json
import os

class StyleRecommendationEngine:
    def __init__(self):
        self.style_guide = self._load_style_guide()
        
    def _load_style_guide(self):
        style_guide_path = os.path.join('config', 'style_guide.json')
        with open(style_guide_path, 'r') as file:
            return json.load(file)
    
    def get_typography_recommendations(self, content_type):
        """Generate typography recommendations based on content type."""
        typography = self.style_guide['brand']['typography']
        return {
            'font_family': typography['primary_font'],
            'size': typography['font_sizes'].get(content_type, typography['font_sizes']['body']),
            'hierarchy': typography['font_hierarchy']
        }
    
    def get_color_scheme(self, brand_style='professional'):
        """Recommend color combinations based on brand style."""
        colors = self.style_guide['brand']['color_palette']
        if brand_style == 'professional':
            return {
                'primary': colors['primary']['editorial_black'],
                'secondary': colors['primary']['classic_cream'],
                'accent': colors['primary']['luxury_gold']
            }
        else:  # creative style
            return {
                'primary': colors['primary']['luxury_gold'],
                'secondary': colors['secondary']['soft_taupe'],
                'accent': colors['accents']['deep_burgundy']
            }
    
    def get_photo_styling_recommendations(self, brand_persona='professional'):
        """Generate comprehensive photo styling recommendations."""
        guidelines = self.style_guide['brand']['photography_guidelines']
        styling = guidelines['styling_recommendations'][brand_persona]
        
        return {
            'lighting': guidelines['lighting'],
            'composition': guidelines['composition'],
            'poses': styling['poses'],
            'wardrobe': styling['wardrobe'],
            'backgrounds': styling['backgrounds']
        }
    
    def generate_complete_style_guide(self, brand_persona='professional'):
        """Generate a complete style guide for the user."""
        return {
            'typography': self.get_typography_recommendations('body'),
            'colors': self.get_color_scheme(brand_persona),
            'photography': self.get_photo_styling_recommendations(brand_persona)
        }