// components/ui/Title.tsx
import React from 'react'

type TitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  as?: 'h1' | 'h2' | 'h3' | 'h4'
}

export function Title({
  as: Tag = 'h2',
  className = '',
  children,
  ...props
}: TitleProps) {
  return (
    <Tag
      className={`font-bold ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
