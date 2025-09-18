# Aesthetic Recipes System v2

A structured, rich prompt generation system for Maya's styling capabilities, replacing simple templating with sophisticated aesthetic intelligence.

## Overview

The Aesthetic Recipes system creates **rich, detailed prompts (150-300+ words)** that read like luxury lifestyle magazine descriptions, while maintaining technical precision for FLUX image generation.

## System Components

### 📚 **Recipes** (`/recipes/`)
- **`types.ts`** - Complete type definitions for aesthetic recipes
- **`index.ts`** - 6 curated aesthetic recipes based on Maya's signature looks

### 🎯 **Selectors** (`/selectors/`)
- **`gender-style-selector.ts`** - Intelligent recipe matching by style, gender, tags, and intent

### ✍️ **Realizers** (`/realizers/`)
- **`sentence-realizer.ts`** - Builds flowing prose descriptions (150-300 words)
- **`flux-realizer.ts`** - Creates technical FLUX prompts with proper format

### 🔧 **Core** 
- **`prompt-builder.ts`** - Main orchestrator that coordinates all components
- **`utils/token-budget.ts`** - Smart trimming that preserves subject/scene content

## Usage

```typescript
import { PromptBuilder } from './prompt-builder';

const result = await PromptBuilder.buildPrompts({
  styleKey: 'scandinavian-minimalist',
  userGender: 'woman',
  userTriggerToken: 'user123',
  userIntent: 'professional photos for my business'
});

// Rich prose description (200+ words)
console.log(result.prompts[0].prose);

// Technical FLUX prompt
console.log(result.prompts[0].fluxPrompt);
// Output: "user123 woman, raw photo, editorial quality, professional photography..."
```

## Recipe Structure

Each aesthetic recipe includes:

- **Gender Variants**: `femaleLook`, `maleLook`, `nonbinaryLook`
- **Atmosphere**: Setting, lighting, composition specs
- **Prose Elements**: Rich narrative components for 150-300 word descriptions
- **Quality Hints**: Technical keywords for FLUX optimization

## Key Features

### ✨ **Rich Content Generation**
- **150-300 word prose** descriptions with flowing narrative style
- **5-element structure**: Setting, lighting, pose, attire, props, atmosphere
- **Story-driven** descriptions that create immersive scenes

### 🎭 **Smart Gender Integration** 
- **Automatic gender detection** and application throughout system
- **Gender-appropriate** pronouns, clothing, and styling choices
- **Inclusive language** for non-binary users

### 🔧 **Technical Excellence**
- **Token budget management** with smart trimming that preserves essential content
- **FLUX-optimized** prompts with proper trigger word + gender format
- **Quality enforcement** through structured recipe system

### 🎨 **Aesthetic Intelligence**
- **Style-aware matching** based on Maya's 12 signature looks
- **Tag-based selection** for flexible matching
- **Intent understanding** for contextual recipe selection

## Supported Aesthetic Recipes

1. **Scandinavian Minimalist** - Clean, bright, intentional simplicity
2. **Urban Moody** - Sophisticated, atmospheric, cinematic edge
3. **Golden Hour Glow** - Warm, authentic, naturally beautiful
4. **White Space Executive** - Modern, powerful, architecturally clean
5. **Night Time Luxe** - Glamorous, sophisticated city energy
6. **High-End Coastal** - Effortless luxury meets seaside elegance

## Integration Points

### Frontend Integration
- Connects to `StyleSelector` component via `styleKey` parameter
- Integrates with `LuxuryChatInterface` for gender-aware messaging
- Used by Maya chat system for rich concept generation

### Backend Integration  
- Used by `maya-optimization-service.ts` for enhanced prompt generation
- Integrates with `gender-prompt.ts` utilities for enforcement
- Applied in API handlers for concept card generation

## Quality Standards

### Prose Quality
- **3-5 sentences minimum** with flowing narrative structure
- **Specific details**: marble countertops, cashmere textures, floor-to-ceiling windows
- **Atmospheric elements**: mood, lighting quality, environmental details
- **Story moments**: natural actions and authentic expressions

### FLUX Quality
- **Proper format**: `<trigger> <gender>, quality_hints, camera, lighting, setting, pose, composition`
- **Technical precision**: Camera specs, lighting details, composition rules
- **Negative prompts**: Quality enforcement through exclusion
- **Gender enforcement**: Automatic application of user's gender identity

## Testing

Run integration tests:
```bash
node client/src/features/maya/prompt/__tests__/integration.test.js
```

Key test areas:
- Gender swap functionality
- Builder retains subject/scene under trimming  
- Prose contains expected camera/light/setting terms
- Token budget preserves essential content

## Performance

- **Cached recipe selection** for repeated style requests
- **Token budget optimization** prevents unnecessary API token usage
- **Fallback strategies** ensure reliability under any conditions
- **Efficient matching** algorithms for real-time style selection

---

This system transforms Maya from generating simple concept cards to creating **luxury lifestyle magazine-quality descriptions** that perfectly match user gender identity and aesthetic preferences while maintaining technical precision for high-quality image generation.
