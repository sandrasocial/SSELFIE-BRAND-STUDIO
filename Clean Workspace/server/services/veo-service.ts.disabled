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
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('Google VEO not configured: missing GOOGLE_API_KEY. (Replicate fallback disabled by configuration)');
  }
  const jobId = await startGoogleVeo(opts);
  return { jobId, provider: 'google' };
}

export async function getVeoStatus(jobId: string, userId: string): Promise<VideoStatusResult> {
  if (!process.env.GOOGLE_API_KEY) {
    return { status: 'failed', error: 'Google VEO not configured' };
  }
  return getGoogleVeoStatus(jobId, userId);
}


// --- Provider Implementations ---

async function startGoogleVeo({ scenes, format, userLoraModel, userId }: StartVideoOptions): Promise<string> {
  console.log('🎬 VEO(Google): Start request', { sceneCount: scenes.length, userId });
  const requestedModel = process.env.VEO_GOOGLE_MODEL;
  let candidateModels: string[] = [];
  if (requestedModel) candidateModels.push(requestedModel);
  try {
    // Attempt to fetch available models and filter those that look like VEO video generation models
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`;
    const listRes = await fetch(listUrl);
    if (listRes.ok) {
      const listJson: any = await listRes.json();
      const veoModels = (listJson.models || [])
        .map((m: any) => m.name?.split('/').pop())
        .filter((n: string) => n && /veo/i.test(n));
      // Preserve explicit request priority, then append discovered models not already included
      for (const m of veoModels) {
        if (!candidateModels.includes(m)) candidateModels.push(m);
      }
      console.log('📋 VEO(Google): Discovered models', candidateModels);
    } else {
      console.log('⚠️ VEO(Google): Could not list models', listRes.status);
    }
  } catch (e) {
    console.log('⚠️ VEO(Google): Model listing failed', e instanceof Error ? e.message : e);
  }
  // Final safety fallback order if discovery empty
  if (candidateModels.length === 0) {
    candidateModels = ['veo-2.0-generate-001', 'veo-2.0-short', 'veo-002', 'veo-001'];
  }

  // Map aspect ratio to expected enum tokens if raw '9:16' / '16:9' unsupported
  const aspectMap: Record<string, string> = {
    '9:16': 'PORTRAIT',
    '16:9': 'LANDSCAPE',
    '1:1': 'SQUARE'
  };
  const mappedAspect = aspectMap[format] || format;

  const processedScenes = scenes.map((s, i) => ({
    prompt: (s.prompt || 'Untitled scene').slice(0, 800),
    duration: clampDuration(s.duration),
    cameraMovement: s.cameraMovement || 'static'
  }));
  const combinedPrompt = processedScenes.map((s, i) => `Scene ${i + 1} (${s.duration}s): ${s.prompt}`).join('\n');
  const totalDuration = processedScenes.reduce((acc, s) => acc + (s.duration || 5), 0);
  const bodyBase: any = {
    prompt: { text: combinedPrompt },
    config: {
      aspectRatio: mappedAspect,
      durationSeconds: Math.min(totalDuration, 60),
      ...(userLoraModel ? { personalizationHint: userLoraModel } : {})
    }
  };
  console.log('🎬 VEO(Google): Payload preview', JSON.stringify({ prompt: { text: bodyBase.prompt.text.slice(0, 160) + '…' }, config: bodyBase.config }, null, 2));

  let lastError: Error | null = null;
  for (const modelVersion of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateVideo?key=${process.env.GOOGLE_API_KEY}`;
    console.log('🔁 VEO(Google): Trying model', modelVersion);
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyBase) });
    if (!res.ok) {
      const raw = await safeRead(res);
      console.error('❌ VEO(Google) start error', { modelVersion, status: res.status, statusText: res.statusText, raw });
      // 404: model not found, attempt fallback
      if (res.status === 404) {
        lastError = new Error(`model ${modelVersion} not found (404)`);
        continue;
      }
      // Other errors: abort immediately
      throw new Error(`Google Veo start failed ${res.status}: ${raw}`);
    }
    const json = await res.json();
    const jobId = json.name || json.operationId || json.id || `googleVeo_${Date.now()}`;
    console.log('✅ VEO(Google): Job started', { jobId, modelVersion });
    return jobId;
  }
  throw new Error(
    `All Google VEO model attempts failed: ${candidateModels.join(', ')} – last error: ${lastError?.message || 'unknown'}.
Troubleshooting steps:
1. Confirm your Google project has VEO video generation access enabled.
2. Ensure the API key is unrestricted or has Generative Language API enabled.
3. Run: curl -s 'https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY' | grep -i veo
4. If no models appear, request access or verify billing.
5. If models appear with different names, set VEO_GOOGLE_MODEL to that exact name.`
  );
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


function clampDuration(d?: number): number { return Math.min(Math.max(d || 5, 1), 12); }

async function safeRead(res: any): Promise<string> { try { return await res.text(); } catch { return '<unreadable body>'; } }
