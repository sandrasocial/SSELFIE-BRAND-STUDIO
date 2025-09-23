/**
 * FLUX Parameter Type Definitions
 * Defines all FLUX-related parameter interfaces for consistent typing across the system
 */
// ✅ MAYA PURE INTELLIGENCE: No hardcoded defaults - Maya controls all parameters
// These will be determined by Maya's AI intelligence for each generation
export const MAYA_DEFAULT_QUALITY_SETTINGS = {
    guidance_scale: 5, // Maya will override
    num_inference_steps: 50, // Maya will override
    aspect_ratio: "4:5", // Maya will override
    megapixels: "1",
    output_format: "png",
    output_quality: 95,
};
