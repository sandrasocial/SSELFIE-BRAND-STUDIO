/**
 * Gender Prompt Injection Utility
 * Ensures every generation prompt explicitly includes the user's gender
 * immediately after the trigger word, preventing cross-gender generations.
 */

const GENDER_REGEX = /\b(woman|women|female|man|men|male|non[- ]?binary|nonbinary)\b/i;

export type SupportedGender = 'woman' | 'man' | 'non-binary';

/**
 * Normalize stored gender value to canonical token used in prompts.
 */
export function normalizeGender(gender?: string | null): SupportedGender | null {
  if (!gender) return null;
  const g = gender.toLowerCase();
  if (g === 'woman' || g === 'female') return 'woman';
  if (g === 'man' || g === 'male') return 'man';
  if (g === 'non-binary' || g === 'nonbinary' || g === 'non binary') return 'non-binary';
  return null;
}

/**
 * Determine if a prompt already clearly specifies gender.
 */
export function promptHasGender(prompt: string): boolean {
  return GENDER_REGEX.test(prompt);
}

/**
 * Inject gender token immediately after trigger word if missing.
 *
 * Rules:
 *  - Keep trigger word as first token (already enforced upstream)
 *  - If gender already present -> return unchanged
 *  - Insert pattern: "<triggerWord> <gender token>, <rest>"
 *  - For non-binary use phrase "non-binary person" for clarity
 */
export function injectGender(triggerWord: string, prompt: string, gender: SupportedGender | null): string {
  if (!gender) return prompt; // Nothing to inject
  if (promptHasGender(prompt)) return prompt; // Already has gender

  const lower = prompt.toLowerCase();
  const startsWithTrigger = lower.startsWith(triggerWord.toLowerCase());
  if (!startsWithTrigger) {
    // Fallback: ensure trigger at front first
    prompt = `${triggerWord} ${prompt}`;
  }

  // Split off the trigger word portion
  const afterTrigger = prompt.slice(triggerWord.length).trimStart();
  const genderToken = gender === 'non-binary' ? 'non-binary person' : gender; 

  // Avoid double commas
  if (afterTrigger.startsWith(',')) {
    return `${triggerWord} ${genderToken}${afterTrigger}`;
  }
  if (afterTrigger.length === 0) {
    return `${triggerWord} ${genderToken}`;
  }
  return `${triggerWord} ${genderToken}, ${afterTrigger}`;
}

/**
 * One-shot convenience: given raw components produce enforced prompt.
 */
export function enforceGender(triggerWord: string, rawPrompt: string, genderRaw?: string | null): string {
  const gender = normalizeGender(genderRaw);
  return injectGender(triggerWord, rawPrompt, gender);
}
