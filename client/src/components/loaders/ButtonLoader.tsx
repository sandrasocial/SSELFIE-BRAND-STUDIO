import * as React from 'react';
import type { ComponentProps, FC } from 'react';

interface ButtonLoaderProps extends ComponentProps<'div'> {}

export const ButtonLoader: FC<ButtonLoaderProps> = React.memo(function ButtonLoader(props) {
  return (
    <div {...props} className={`editorial-spinner w-4 h-4 ${props.className || ''}`} />
  );
});

ButtonLoader.displayName = 'ButtonLoader';