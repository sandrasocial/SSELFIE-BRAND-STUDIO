# 🔒 SSELFIE STUDIO - IMMUTABLE CORE ARCHITECTURE V2 (UPDATED)

## ⚠️ CRITICAL UPDATE - JULY 16, 2025 ⚠️

**THIS ARCHITECTURE HAS BEEN UPDATED TO V2 AND IS NOW LOCKED**

Based on user feedback and quality testing, the architecture has been updated to use individual user models for better quality and isolation. This V2 architecture is now PERMANENT and must never be changed.

## 🔒 FLUX INDIVIDUAL MODEL ARCHITECTURE (PERMANENT)

### Individual User Models (IMMUTABLE)
Each user has their own complete trained FLUX model:
```
sandrasocial/{userId}-selfie-lora:{versionId}
```

### User Model Generation (IMMUTABLE)
```json
{
  "version": "sandrasocial/{userId}-selfie-lora:{versionId}",
  "input": {
    "prompt": "user{userId} professional headshot...",
    "guidance": 2.8,
    "num_inference_steps": 35,
    "output_quality": 95,
    "num_outputs": 3,
    "aspect_ratio": "3:4"
  }
}
```

### Training Architecture (IMMUTABLE)
- **Training Model**: `ostris/flux-dev-lora-trainer:26dce37af90b9d997eeb970d92e47de3064d46c300504ae376c75bef6a9022d2`
- **Output**: Individual complete models `sandrasocial/{userId}-selfie-lora`
- **Storage**: Database stores `replicate_model_id` and `replicate_version_id`

## 🚫 ZERO TOLERANCE POLICY (PERMANENT)

### What Is FORBIDDEN:
- Using base model + LoRA weights approach (OLD V1 approach)
- Any fallback models or placeholder data
- Cross-contamination between users
- Mock images or shared models
- Any approach other than individual user models

### What Is REQUIRED:
- Every user MUST train their own individual complete model
- Generation MUST use user's individual model version ONLY
- NO exceptions for any user under any circumstances
- Error messages guide users to complete training

## 📁 FILES IMPLEMENTING THIS ARCHITECTURE

### Core Services (LOCKED)
- `server/ai-service.ts` - Maya AI image generation
- `server/image-generation-service.ts` - AI Photoshoot service  
- `server/routes.ts` - Direct API endpoints
- `server/model-training-service.ts` - User model training

### Implementation Details
ALL generation services MUST use this exact pattern:
```typescript
const userTrainedVersion = `${userModel.replicateModelId}:${userModel.replicateVersionId}`;

const requestBody = {
  version: userTrainedVersion, // User's individual trained model ONLY
  input: {
    prompt: finalPrompt,
    guidance: 2.8,
    num_inference_steps: 35,
    output_quality: 95,
    num_outputs: 3,
    aspect_ratio: "3:4"
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