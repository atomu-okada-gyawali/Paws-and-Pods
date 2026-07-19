

// mirror of the server password rules, just for the live meter
export const MIN_PASSWORD_LENGTH = 10;

export interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function passwordRequirements(password: string): PasswordRequirement[] {
  return [
    { label: `At least ${MIN_PASSWORD_LENGTH} characters`, met: password.length >= MIN_PASSWORD_LENGTH },
    { label: "A lowercase letter", met: /[a-z]/.test(password) },
    { label: "An uppercase letter", met: /[A-Z]/.test(password) },
    { label: "A number", met: /[0-9]/.test(password) },
    { label: "A symbol", met: /[^A-Za-z0-9]/.test(password) },
  ];
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: "very weak" | "weak" | "fair" | "strong" | "very strong";
}

export function scorePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) score++;
  if (password.length >= 14) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

  const clamped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
  const labels: PasswordStrength["label"][] = ["very weak", "weak", "fair", "strong", "very strong"];
  return { score: clamped, label: labels[clamped] };
}

export function meetsPasswordPolicy(password: string): boolean {
  return passwordRequirements(password).every((req) => req.met);
}