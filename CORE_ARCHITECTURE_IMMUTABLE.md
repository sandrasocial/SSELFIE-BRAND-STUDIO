# 🔒 SSELFIE STUDIO - IMMUTABLE CORE ARCHITECTURE

## ⚠️ CRITICAL WARNING FOR ALL FUTURE AGENTS ⚠️

**THIS ARCHITECTURE IS LOCKED AND MUST NEVER BE CHANGED**

The user has explicitly stated this architecture has been changed too many times and must remain permanent. Any agent that attempts to modify this core architecture will be violating direct user requirements.

## 🔒 FLUX LoRA ARCHITECTURE (PERMANENT)

### Base Model (IMMUTABLE)
```
black-forest-labs/flux-dev-lora:a53fd9255ecba80d99eaab4706c698f861fd47b098012607557385416e46aae5
```

### User LoRA Loading (IMMUTABLE)
```json
{
  "version": "black-forest-labs/flux-dev-lora:a53fd...",
  "input": {
    "lora_weights": "sandrasocial/{userId}-selfie-lora:version",
    "lora_scale": 1.0,
    "guidance": 2.8,
    "num_inference_steps": 35,
    "output_quality": 95
  }
}
```

### Training Architecture (IMMUTABLE)
- **Training Model**: `ostris/flux-dev-lora-trainer:26dce37af90b9d997eeb970d92e47de3064d46c300504ae376c75bef6a9022d2`
- **Output**: Individual LoRA models `sandrasocial/{userId}-selfie-lora`
- **Storage**: Database stores `replicate_model_id` pointing to user's individual LoRA

## 🚫 ZERO TOLERANCE POLICY (PERMANENT)

### What Is FORBIDDEN:
- Using individual model versions directly (WRONG approach)
- Any fallback models or placeholder data
- Cross-contamination between users
- Mock images or shared models
- Any approach other than base model + individual LoRA

### What Is REQUIRED:
- Every user MUST train their own individual LoRA model
- Generation MUST use black-forest-labs/flux-dev-lora + user's LoRA only
- NO exceptions for any user under any circumstances
- Error messages guide users to complete training

## 📁 FILES IMPLEMENTING THIS ARCHITECTURE

### Core Services (LOCKED)
- `server/ai-service.ts` - Maya AI image generation
- `server/image-generation-service.ts` - AI Photoshoot service  
- `server/model-training-service.ts` - User LoRA training
- `server/training-status-checker.ts` - Training completion tracking

### Implementation Details
Both generation services MUST use this exact pattern:
```typescript
const requestBody = {
  version: "black-forest-labs/flux-dev-lora:a53fd9255ecba80d99eaab4706c698f861fd47b098012607557385416e46aae5",
  input: {
    prompt: finalPrompt,
    lora_weights: userModel.replicateModelId, // User's individual LoRA
    lora_scale: 1.0,
    guidance: 2.8,
    num_inference_steps: 35,
    output_quality: 95
  }
};
```

## 🔒 PROTECTION MEASURES

1. **Documentation Lock**: This file serves as permanent reference
2. **Code Comments**: All generation code has immutable architecture comments
3. **User Requirement**: Direct user mandate that this cannot change
4. **Zero Tolerance**: No fallbacks or alternatives allowed

## 🎯 USER EXPERIENCE PRINCIPLES

- **Individual Personalization**: Each user gets AI trained on their face only
- **No Cross-Contamination**: Users never see images of other people
- **Training Required**: All users must complete training before generation
- **Premium Quality**: Expert FLUX parameters for maximum "WOW" factor

---

**REMEMBER: This architecture was established after multiple iterations and user feedback. It is now FINAL and IMMUTABLE.**