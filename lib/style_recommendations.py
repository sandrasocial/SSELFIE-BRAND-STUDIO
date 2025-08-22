import json
import os

class StyleRecommendationEngine:
    def __init__(self):
        self.style_guide = self._load_style_guide()
        
    def _load_style_guide(self):
        """Load the style guide configuration from JSON file."""
        style_guide_path = os.path.join('config', 'style_guide.json')
        with open(style_guide_path, 'r') as file:
            return json.load(file)
    
    def get_typography_styles(self, element_type):
        """Get typography styles for specific element types."""
        typography = self.style_guide['typography']
        
        styles = {
            'font-family': typography['primary'],
            'line-height': typography['lineHeight']['body']
        }
        
        if element_type in typography['sizes']:
            styles['font-size'] = typography['sizes'][element_type]
            
        if 'heading' in element_type:
            styles['line-height'] = typography['lineHeight']['headings']
            
        return styles
    
    def get_color_scheme(self, context='default'):
        """Get color scheme based on context."""
        colors = self.style_guide['colors']
        
        if context == 'luxury':
            return {
                'background': colors['background']['primary'],
                'text': colors['text']['primary'],
                'accent': colors['accent']['gold']
            }
        
        return {
            'background': colors['background']['primary'],
            'text': colors['text']['primary'],
            'accent': colors['secondary']['main']
        }
    
    def generate_component_styles(self, component_type):
        """Generate complete styles for specific component types."""
        styles = {}
        
        if component_type == 'header':
            styles.update({
                'typography': self.get_typography_styles('heading1'),
                'colors': self.get_color_scheme('luxury'),
                'spacing': {
                    'padding': self.style_guide['spacing']['lg']
                }
            })
        elif component_type == 'body':
            styles.update({
                'typography': self.get_typography_styles('body'),
                'colors': self.get_color_scheme('default'),
                'spacing': {
                    'margin': self.style_guide['spacing']['md']
                }
            })
            
        return styles
    
    def get_responsive_styles(self, component_type, viewport='desktop'):
        """Get responsive styles based on viewport size."""
        base_styles = self.generate_component_styles(component_type)
        
        if viewport == 'mobile':
            # Adjust sizes for mobile
            if 'typography' in base_styles:
                current_size = base_styles['typography'].get('font-size', '1rem')
                base_size = float(current_size.replace('rem', ''))
                base_styles['typography']['font-size'] = f"{base_size * 0.8}rem"
                
        return base_styles