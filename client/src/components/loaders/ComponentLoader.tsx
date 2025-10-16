import * as React from 'react';
import type { ComponentProps, FC } from 'react';

interface ComponentLoaderProps extends ComponentProps<'div'> {}

export const ComponentLoader: FC<ComponentLoaderProps> = React.memo(function ComponentLoader(props) {
  return (
    <div {...props} className={`flex items-center justify-center p-editorial-sm ${props.className || ''}`}>
      <div className="editorial-spinner w-6 h-6" />
    </div>
  );
});

ComponentLoader.displayName = 'ComponentLoader';