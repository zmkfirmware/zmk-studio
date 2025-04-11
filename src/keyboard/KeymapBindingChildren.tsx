import { HidUsageLabel } from "./HidUsageLabel";

export interface KeyBinding {
  param1: number;
  param2: number;
}

const renderIndicator = (numbers: 0|1|2|3 = 1): JSX.Element => (
    <div className="absolute ml-0.5 h-full flex flex-col justify-evenly py-1">
      {Array.from({ length: Math.max(1, numbers) }, (_, i) => (
        <div 
          key={i}
          className="bg-gray-900 opacity-80 rounded-full" 
          style={{
            width: '.2rem',
            height: numbers === 0 ? '0.8rem' : '.2rem',
          }}
        />
      ))}
    </div>
  );

export const getBindingChildren = (
  header: string,
  binding: KeyBinding,
): JSX.Element | JSX.Element[] => {
  if (header === "Layer-Tap") {
    return [
        <div className="relative text-sm">
          {renderIndicator(1)}
          <HidUsageLabel hid_usage={binding.param2}/>
        </div>,
        <div className="text-xs truncate relative">
          {renderIndicator(0)}
          <svg className="inline-block mb-0.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.235 1.559a.5.5 0 0 0-.47 0l-7.5 4a.5.5 0 0 0 0 .882L3.188 8 .264 9.559a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882L12.813 8l2.922-1.559a.5.5 0 0 0 0-.882zm3.515 7.008L14.438 10 8 13.433 1.562 10 4.25 8.567l3.515 1.874a.5.5 0 0 0 .47 0zM8 9.433 1.562 6 8 2.567 14.438 6z"/>
          </svg>
          {binding.param1}
        </div>
    ];
  }

  if (header === "Mod-Tap") {
    return [
        <div className="relative">
          {renderIndicator(1)}
          <span className="text-sm">
            <HidUsageLabel hid_usage={binding.param2}/>
          </span>
        </div>,
        <div className="text-xs relative">
          {renderIndicator(0)}
          <HidUsageLabel hid_usage={binding.param1}/>
        </div>
    ];
  }

  return (
    <div className="relative">
      <span className="text-base">
        <HidUsageLabel
          hid_usage={binding.param1}
        />
      </span>
    </div>
  );
};