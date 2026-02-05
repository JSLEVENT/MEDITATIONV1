'use client';

import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

export default function PrimaryButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        'bg-teal text-white hover:bg-teal/90 transition px-4 py-2 rounded-md',
        className
      )}
      {...props}
    />
  );
}
