import './key.css';

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
  label: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

interface KeyDimension {
  width: number,
  height: number,
};

function makeSize({ width, height}: KeyDimension): KeyDimension {
  width = scale(width);
  height = scale(height);

  return {
    width,
    height
  };
}

/**
 * Primary UI component for user interaction
 */
export const Key = ({
  primary = false,
  label,
  ...props
}: KeyProps) => {
  const mode = primary ? 'zmk-key__button--primary' : 'zmk-key__button--secondary';
  const size = makeSize(props);
  return (
    <div
    className='zmk-key'
    style={size}
    {...props}>
      <button
        type="button"
        className={['zmk-key__button', mode].join(' ')}
      >
        {label}
      </button>
    </div>
  );
};
