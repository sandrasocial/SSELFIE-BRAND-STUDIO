import React from 'react'
import type { ComponentProps } from 'react'

interface [ComponentName]Props {
  // Define props with clear types
  id?: string
  className?: string
  children?: React.ReactNode
}

export function [ComponentName]({ 
  id, 
  className = '', 
  children,
  ...props 
}: [ComponentName]Props) {
  return (
    <div 
      id={id}
      className={`font-serif ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// Default export for dynamic imports
export default [ComponentName]