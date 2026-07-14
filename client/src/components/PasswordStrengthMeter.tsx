/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { passwordRequirements, scorePasswordStrength } from "../lib/passwordPolicy";
import { Check, X } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
}

const BAR_COLORS = ["bg-rose-500", "bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-600"];
const LABEL_COLORS = ["text-rose-600", "text-rose-600", "text-amber-600", "text-emerald-600", "text-emerald-700"];

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) return null;

  const { score, label } = scorePasswordStrength(password);
  const requirements = passwordRequirements(password);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < score ? BAR_COLORS[score] : "bg-neutral-200"
              }`}
            />
          ))}
        </div>
        <span className={`text-[10px] font-semibold uppercase tracking-wide ${LABEL_COLORS[score]}`}>
          {label}
        </span>
      </div>

      <ul className="space-y-1">
        {requirements.map((req) => (
          <li key={req.label} className="flex items-center gap-1.5 text-[11px]">
            {req.met ? (
              <Check className="w-3 h-3 text-emerald-600 shrink-0" />
            ) : (
              <X className="w-3 h-3 text-neutral-300 shrink-0" />
            )}
            <span className={req.met ? "text-neutral-600" : "text-neutral-400"}>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
