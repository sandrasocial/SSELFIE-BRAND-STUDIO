# 🚨 CRITICAL ARCHITECTURE CONFLICT - JULY 16, 2025

## **CONFLICTING DOCUMENTATION FOUND**

### **Two Contradictory Architecture Documents:**

1. **CORE_ARCHITECTURE_IMMUTABLE.md** (V1):
   - Uses: `black-forest-labs/flux-dev-lora` + `lora_weights` parameter
   - Says individual model versions are "WRONG approach"
   - Forbids using individual model versions directly

2. **CORE_ARCHITECTURE_IMMUTABLE_V2.md** (V2):  
   - Uses: `sandrasocial/{userId}-selfie-lora:{versionId}` individual models
   - Says NO shared models, NO base model + LoRA approach
   - Requires individual trained model versions ONLY

### **Current System Implementation:**
- ✅ **ai-service.ts**: Uses V2 approach (individual models)
- ✅ **image-generation-service.ts**: Uses V2 approach (individual models)  
- ✅ **routes.ts**: JUST FIXED to use V2 approach (individual models)

### **Database Reality:**
Users have individual trained models like:
- `sandrasocial/45038279-selfie-lora:f29c5c6b...`
- `sandrasocial/45075281-selfie-lora:f69d18eb...`
- `sandrasocial/42585527-selfie-lora:b9fab7ab...`

### **Working System Evidence:**
- Logs show: "🔒 ARCHITECTURE VALIDATION: Maya AI Generation - Using correct FLUX individual model architecture"
- Users successfully generating images with individual models
- No `lora_weights` parameter usage found anywhere in current code

### **CRITICAL QUESTION FOR USER:**
Which architecture should be enforced system-wide?

**Option A - V1 (Base Model + LoRA)**:
```javascript
{
  "version": "black-forest-labs/flux-dev-lora:a53fd...",
  "input": {
    "lora_weights": "sandrasocial/{userId}-selfie-lora:version",
    "lora_scale": 1.0,
    "prompt": "..."
  }
}
```

**Option B - V2 (Individual Models)**:
```javascript
{
  "version": "sandrasocial/{userId}-selfie-lora:{versionId}",
  "input": {
    "prompt": "...",
    "guidance": 2.8,
    "num_inference_steps": 35
  }
}
```

### **RECOMMENDATION:**
Continue with **V2 approach** because:
1. Currently working and generating quality images
2. Better user isolation and privacy
3. Matches existing database structure
4. User reported V2 fixes quality issues

**IMMEDIATE ACTION NEEDED:**
User must clarify which architecture to enforce across the entire system.