/**
 * Simple utility to scrub potential secrets from generated content.
 * In a real implementation, this would use more complex regex and potentially LLM assistance.
 */
export const scrubSecrets = (content: string): string => {
  // Generic pattern for API keys: looks for strings like API_KEY="...", key: "...", etc.
  const patterns = [
    /(key|secret|password|token|auth)["']?\s*[:=]\s*["']?([a-zA-Z0-9-_{}]{16,})["']?/gi,
    /([a-z0-9/+=]{40,})/gi, // Potential long base64 tokens
  ];

  let scrubbed = content;
  patterns.forEach(pattern => {
    scrubbed = scrubbed.replace(pattern, (match, p1, p2) => {
      if (p2) return `${p1}: [REDACTED]`;
      return "[REDACTED]";
    });
  });

  return scrubbed;
};
