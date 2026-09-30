import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '../../lib/cn'

import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles'

export type { ButtonSize, ButtonVariant }

type Common = { variant?: ButtonVariant; size?: ButtonSize; block?: boolean; children: ReactNode }

export function Button({
  variant,
  size,
  block,
  className,
  type = 'button',
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, cn(block && 'w-full', className))}
      {...rest}
    />
  )
}

export function ButtonLink({ variant, size, block, className, ...rest }: Common & LinkProps) {
  return (
    <Link className={buttonClasses(variant, size, cn(block && 'w-full', className))} {...rest} />
  )
}
