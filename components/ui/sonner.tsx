"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = (props: ToasterProps) => (
  <Sonner
    theme="light"
    className="toaster group"
    style={
      {
        "--normal-bg": "#ffffff",
        "--normal-text": "#121a0c",
        "--normal-border": "#d5ddc8",
      } as React.CSSProperties
    }
    {...props}
  />
)

export { Toaster }
