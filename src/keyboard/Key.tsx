import './key.css';

import { PropsWithChildren, Children } from 'react';
import { scale } from './geometry';

interface KeyProps {
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean;
  /**
   * How large should the button be?
   */
  width: number;
  height: number;
  /**
   * Button contents
   */
  header: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

interface KeyDimension {
  width: number,
  height: number,
};

function makeSize({ width, height}: KeyDimension) {
  width = scale(width);
  height = scale(height);

  return {
    '--zmk-key-center-width': 'calc(' + width + 'px - 2px)',
    '--zmk-key-center-height': 'calc(' + height + 'px - 2px)'
  };
}

/**
 * Primary UI component for user interaction
 */
export const Key = ({
  primary = false,
  header,
  ...props
}: PropsWithChildren<KeyProps>) => {
  const mode = primary ? 'zmk-key__button--primary' : 'zmk-key__button--secondary';
  const size = makeSize(props);
  const children = Children.map(props.children, (c) => <div className="zmk-key__button__child">{c}</div>);

  return (
    <div
    className='zmk-key'
    style={size}
    {...props}>
      <button
        type="button"
        className={['zmk-key__button', mode].join(' ')}
      >
        <span className="zmk-key__button__header">{header}</span>
        {children}
      </button>
    </div>
  );
};
