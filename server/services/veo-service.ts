import fetch from 'node-fetch';

export interface VeoScene {
  prompt: string;
  duration?: number; // seconds
  cameraMovement?: string;
  textOverlay?: string;
  imageUrl?: string;
}

export interface StartVideoOptions {
  scenes: VeoScene[];
  format: '16:9' | '9:16';
  userLoraModel: string | null;
  userId: string;
}

export interface StartVideoResult {
  jobId: string;
  provider: 'google' | 'replicate';
}

export interface VideoStatusResult {
  status: string; // processing | succeeded | failed | pending
  progress?: number;
  videoUrl?: string | null;
  error?: string | null;
  estimatedTime?: string | null;
  createdAt?: string;
  completedAt?: string;
}

// Public API
export async function startVeoVideo(opts: StartVideoOptions): Promise<StartVideoResult> {
  if (process.env.GOOGLE_API_KEY) {
    const jobId = await startGoogleVeo(opts);
    return { jobId, provider: 'google' };
  }
  const jobId = await startReplicateVeo(opts);
  return { jobId, provider: 'replicate' };
}

export async function getVeoStatus(jobId: string, userId: string): Promise<VideoStatusResult> {
  if (process.env.GOOGLE_API_KEY) {
    return getGoogleVeoStatus(jobId, userId);
  }
  return getReplicateVeoStatus(jobId, userId);
}

// --- Provider Implementations ---

async function startGoogleVeo({ scenes, format, userLoraModel, userId }: StartVideoOptions): Promise<string> {
  console.log('🎬 VEO(Google): Start request', { sceneCount: scenes.length, userId });
  const modelVersion = process.env.VEO_GOOGLE_MODEL || 'veo-001';
  const processedScenes = scenes.map((s, i) => ({
    prompt: (s.prompt || 'Untitled scene').slice(0, 800),
    duration: clampDuration(s.duration),
    cameraMovement: s.cameraMovement || 'static'
  }));
  const combinedPrompt = processedScenes.map((s, i) => `Scene ${i + 1} (${s.duration}s): ${s.prompt}`).join('\n');
  const totalDuration = processedScenes.reduce((acc, s) => acc + (s.duration || 5), 0);
  const body: any = {
    prompt: { text: combinedPrompt },
    config: {
      aspectRatio: format,
      durationSeconds: Math.min(totalDuration, 60),
      ...(userLoraModel ? { personalizationHint: userLoraModel } : {})
    }
  };
  console.log('🎬 VEO(Google): Payload preview', JSON.stringify({ prompt: { text: body.prompt.text.slice(0, 160) + '…' }, config: body.config }, null, 2));
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateVideo?key=${process.env.GOOGLE_API_KEY}`;
  const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) {
    const raw = await safeRead(res);
    console.error('❌ VEO(Google) start error', res.status, res.statusText, raw);
    throw new Error(`Google Veo start failed ${res.status}: ${raw}`);
  }
  const json = await res.json();
  const jobId = json.name || json.operationId || json.id || `googleVeo_${Date.now()}`;
  console.log('✅ VEO(Google): Job started', jobId);
  return jobId;
}

async function startReplicateVeo({ scenes, format, userLoraModel, userId }: StartVideoOptions): Promise<string> {
  console.log('🎬 VEO(Replicate): Start request', { sceneCount: scenes.length, userId });
  const veoInput: Record<string, any> = {
    scenes: scenes.map(s => ({
      prompt: s.prompt?.slice(0, 800) || 'Untitled scene',
      duration: clampDuration(s.duration),
      ...(userLoraModel ? { lora_model: userLoraModel } : {}),
      aspect_ratio: format,
      camera_movement: s.cameraMovement || 'static',
      ...(s.textOverlay ? { text_overlay: s.textOverlay } : {})
    })),
    video_format: format,
    format,
    fps: 24,
    quality: 'high',
    consistency: 'high'
  };
  Object.keys(veoInput).forEach(k => { if (veoInput[k] == null) delete veoInput[k]; });
  const body = { version: process.env.VEO_MODEL_VERSION || 'latest', input: veoInput };
  console.log('🎬 VEO(Replicate): Payload preview', JSON.stringify({ ...body, input: { ...body.input, scenes: body.input.scenes.map((s: any) => ({ ...s, prompt: s.prompt.slice(0, 60) + '…' })) } }, null, 2));
  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const raw = await safeRead(res);
    console.error('❌ VEO(Replicate) start error', res.status, res.statusText, raw);
    if (res.status === 422) throw new Error(`VEO 422 Unprocessable Entity: ${raw}`);
    throw new Error(`Replicate Veo start failed ${res.status}: ${raw}`);
  }
  const json = await res.json();
  console.log('✅ VEO(Replicate): Job started', json.id);
  return json.id;
}

async function getGoogleVeoStatus(jobId: string, userId: string): Promise<VideoStatusResult> {
  try {
    const opName = jobId.startsWith('operations/') ? jobId : `operations/${jobId}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/${opName}?key=${process.env.GOOGLE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return { status: 'failed', error: `Google status ${res.status}` };
    const json = await res.json();
    if (json.error) return { status: 'failed', error: json.error.message };
    if (!json.done) return { status: 'processing', progress: 0, estimatedTime: '2-5 minutes' };
    const videoUrl = json.response?.video?.uri || json.response?.uri || null;
    return { status: 'succeeded', progress: 100, videoUrl };
  } catch (e) {
    return { status: 'failed', error: e instanceof Error ? e.message : 'Google status failed' };
  }
}

async function getReplicateVeoStatus(jobId: string, userId: string): Promise<VideoStatusResult> {
  try {
    const res = await fetch(`https://api.replicate.com/v1/predictions/${jobId}`, { headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` } });
    if (!res.ok) return { status: 'failed', error: `Replicate status ${res.status}` };
    const json = await res.json();
    return {
      status: json.status,
      progress: json.status === 'processing' ? (json.progress || 0) : (json.status === 'succeeded' ? 100 : 0),
      videoUrl: json.output,
      error: json.error,
      estimatedTime: json.status === 'starting' ? '2-5 minutes' : null,
      createdAt: json.created_at,
      completedAt: json.completed_at
    };
  } catch (e) {
    return { status: 'failed', error: e instanceof Error ? e.message : 'Replicate status failed' };
  }
}

function clampDuration(d?: number): number { return Math.min(Math.max(d || 5, 1), 12); }

async function safeRead(res: any): Promise<string> { try { return await res.text(); } catch { return '<unreadable body>'; } }
