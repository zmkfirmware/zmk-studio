interface KeycodeProps {
  id: number;
  label: string;
  width?: number;
  height?: number;
  x: number;
  y: number;
}

export default function Keycode(props: KeycodeProps) {
  const style = {
    left: `${props.x * (props.width ?? 50)}px`,
    top: `${props.y * (props.height ?? 50)}px`,
    width: `${props.width ?? 50}px`,
    height: `${props.height ?? 50}px`,
    marginRight: "0.1rem",
    overflow: "hidden",
  };




  return (
      <button className="btn btn-square btn-outline absolute" style={style}  dangerouslySetInnerHTML={{ __html: props.label }}>
      </button>
  );
}
