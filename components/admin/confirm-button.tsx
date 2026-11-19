"use client"

import { SubmitButton } from "./submit-button"

/** Submit button that asks for confirmation first (works inside plain <form action>). */
export function ConfirmButton({ message, children, variant = "danger", className }: { message: string; children: React.ReactNode; variant?: "lime" | "ghost" | "danger"; className?: string }) {
  return (
    <span onClickCapture={(e) => { if (!confirm(message)) { e.preventDefault(); e.stopPropagation() } }} className="contents">
      <SubmitButton variant={variant} className={className}>{children}</SubmitButton>
    </span>
  )
}
