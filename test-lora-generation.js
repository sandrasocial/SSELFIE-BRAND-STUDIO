// Test script to verify LoRA generation is working correctly
const testPayload = {
  version: "black-forest-labs/flux-dev-lora:a53fd9255ecba80d99eaab4706c698f861fd47b098012607557385416e46aae5",
  input: {
    prompt: "user43782722, professional portrait in a modern office, shot with Canon EOS R5, 85mm f/1.4 lens",
    guidance: 3.5,
    lora_weights: "sandrasocial/43782722-selfie-lora", 
    lora_scale: 1.0,
    num_inference_steps: 32,
    num_outputs: 1,
    aspect_ratio: "3:4",
    output_format: "png",
    output_quality: 100,
    megapixels: "1",
    go_fast: false,
    disable_safety_checker: false
  }
};

console.log('🧪 Testing LoRA generation with correct schema...');
console.log('Model:', testPayload.version);
console.log('LoRA weights:', testPayload.input.lora_weights);
console.log('Trigger word in prompt:', testPayload.input.prompt.includes('user43782722'));

// Test the API call
fetch('https://api.replicate.com/v1/predictions', {
  method: 'POST',
  headers: {
    'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testPayload)
})
.then(response => response.json())
.then(data => {
  console.log('✅ Replicate response:', JSON.stringify(data, null, 2));
  
  if (data.id) {
    console.log(`🎯 Prediction started successfully: ${data.id}`);
    console.log('This confirms our schema is correct!');
  } else if (data.detail) {
    console.log('❌ Error:', data.detail);
  }
})
.catch(error => {
  console.error('❌ Request failed:', error.message);
});