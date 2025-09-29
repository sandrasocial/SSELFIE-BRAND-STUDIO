const GENDER_REGEX = /\b(woman|women|female|man|men|male|non[- ]?binary|nonbinary)\b/i;
export function normalizeGender(gender) {
    if (!gender)
        return null;
    const g = gender.toLowerCase();
    if (g === 'woman' || g === 'female')
        return 'woman';
    if (g === 'man' || g === 'male')
        return 'man';
    if (g === 'non-binary' || g === 'nonbinary' || g === 'non binary')
        return 'non-binary';
    return null;
}
export function promptHasGender(prompt) {
    return GENDER_REGEX.test(prompt);
}
export function injectGender(triggerWord, prompt, gender) {
    if (!gender)
        return prompt;
    if (promptHasGender(prompt))
        return prompt;
    const lower = prompt.toLowerCase();
    const startsWithTrigger = lower.startsWith(triggerWord.toLowerCase());
    if (!startsWithTrigger) {
        prompt = `${triggerWord} ${prompt}`;
    }
    const afterTrigger = prompt.slice(triggerWord.length).trimStart();
    const genderToken = gender === 'non-binary' ? 'non-binary person' : gender;
    if (afterTrigger.startsWith(',')) {
        return `${triggerWord} ${genderToken}${afterTrigger}`;
    }
    if (afterTrigger.length === 0) {
        return `${triggerWord} ${genderToken}`;
    }
    return `${triggerWord} ${genderToken}, ${afterTrigger}`;
}
export function enforceGender(triggerWord, rawPrompt, genderRaw) {
    const gender = normalizeGender(genderRaw);
    return injectGender(triggerWord, rawPrompt, gender);
}
//# sourceMappingURL=gender-prompt.js.map