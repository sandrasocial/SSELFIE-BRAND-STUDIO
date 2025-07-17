# PROMPT CONFIGURATION BACKUP - July 16, 2025
## BEFORE REALISTIC UPDATE - ROLLBACK REFERENCE

This file contains the exact prompt configurations before implementing realistic updates.
Use this to rollback if the new realistic version doesn't work properly.

## MODEL TRAINING SERVICE - CURRENT PROMPTS

### Film Enhancement (Line 399):
```javascript
const filmEnhancement = "shot on Hasselblad X2D 100C, 90mm lens, heavy 35mm film grain, matte skin finish, authentic skin texture with visible pores, natural imperfections, analog film photography aesthetic, raw film negative quality, no glossy skin, no shiny skin, no oily skin, natural matte complexion, dry skin texture, non-reflective skin, natural skin oils minimal, authentic film grain texture, pronounced grain structure, Kodak Portra 400 film aesthetic";
```

### Subtle Retouching (Line 406):
```javascript
const subtleRetouching = "subtle light retouching, softened harsh lines, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement, preserve natural skin imperfections, avoid plastic look, maintain authentic texture, enhanced natural glow, improved skin radiance, soft highlight enhancement, natural luminosity boost, editorial beauty enhancement, refined natural features";
```

### Hair Enhancement (Line 405):
```javascript
hairColorConsistency = "consistent hair color, natural hair tone, voluminous hair, hair with movement, tousled hair, effortless styling, bouncy hair, textured hair, never flat hair, perfectly imperfect hair";
```

## IMAGE GENERATION SERVICE - CURRENT PROMPTS

### Expert Quality Specs:
```javascript
const expertQualitySpecs = ", raw photograph, subtle skin texture (1.6), natural skin detail, soft film grain (Kodak Ektar:1.3), natural skin with gentle smoothing, medium-format film aesthetic (1.5), realistic hair with volume, natural hair texture, never flat hair, hyperrealistic facial features, authentic skin tone, natural healthy glow, subtle skin refinement, professional photography";
```

### Premium Hair Specs:
```javascript
const premiumHairSpecs = ", natural hair with volume and movement, realistic hair texture, voluminous healthy hair, never flat or lifeless hair, natural hair flow";
```

## AI PHOTOSHOOT COLLECTION PROMPTS - CURRENT BASE FORMAT

### Example Base Prompt Structure:
```javascript
prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in oversized cream cashmere sweater holding ceramic coffee mug by large window, soft morning light streaming through sheer curtains, minimal Scandinavian interior with natural wood and white walls, serene contemplative expression, effortless tousled hair, sitting in modern chair, shot on Leica Q2 with 28mm f/1.7 lens, natural window lighting, hygge lifestyle photography, cozy home aesthetic, morning ritual vibes'
```

## NEGATIVE PROMPTS - CURRENT
```javascript
negative_prompt: "portrait, headshot, passport photo, studio shot, centered face, isolated subject, corporate headshot, ID photo, school photo, posed, glossy skin, shiny skin, oily skin, plastic skin, overly polished, artificial lighting, fake appearance, heavily airbrushed, perfect skin, flawless complexion, heavy digital enhancement, strong beauty filter, unrealistic skin texture, synthetic appearance, smooth skin, airbrushed, retouched, magazine retouching, digital perfection, waxy skin, doll-like skin, porcelain skin, flawless makeup, heavy foundation, concealer, smooth face, perfect complexion, digital smoothing, beauty app filter, Instagram filter, snapchat filter, face tune, photoshop skin, shiny face, polished skin, reflective skin, wet skin, slick skin, lacquered skin, varnished skin, glossy finish, artificial shine, digital glow, skin blur, inconsistent hair color, wrong hair color, blonde hair, light hair, short hair, straight hair, flat hair, limp hair, greasy hair, stringy hair, unflattering hair, bad hair day, messy hair, unkempt hair, oily hair, lifeless hair, dull hair, damaged hair"
```

## ROLLBACK INSTRUCTIONS

If the realistic update doesn't work:
1. Copy the exact text from this backup file
2. Replace the new prompts with these original versions
3. Restart the workflow to apply changes
4. Test image generation to confirm rollback success

## ARTIFICIAL ELEMENTS BEING REMOVED
- `subsurface scattering` (3D rendering term)
- `hyperrealistic facial features` (AI art term) 
- `(1.6)`, `(1.5)`, `:1.3` weight specifications
- `unretouched natural skin texture` + `subtle light retouching` (contradictory)
- `medium-format film aesthetic (1.5)`
- Multiple conflicting skin descriptions

## REALISTIC ELEMENTS BEING ENHANCED
- Professional camera specifications (Hasselblad, Leica, Canon)
- Authentic film grain (35mm, Kodak Portra)
- Natural lighting descriptions
- Real-world scenarios and environments
- Simplified skin descriptions
- Consistent hair enhancement without AI terms