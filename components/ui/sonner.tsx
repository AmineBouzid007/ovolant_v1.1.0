"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = (props: ToasterProps) => (
  <Sonner
    theme="dark"
    className="toaster group"
    style={
      {
        "--normal-bg": "#0d141d",
        "--normal-text": "#e8eff7",
        "--normal-border": "#213142",
      } as React.CSSProperties
    }
    {...props}
  />
)

export { Toaster }
