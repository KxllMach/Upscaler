import { useState } from "react";
import { Button } from "./ui/button";

interface UpscaleOptionsProps {
  onUpscale: (options: { model: string; format: string }) => void;
  disabled?: boolean;
}

const AI_MODELS = [
  {
    id: 'esrgan',
    name: 'ESRGAN',
    description: 'General purpose model for most images. Provides a good balance between detail and artifact reduction.',
  },
  {
    id: 'esrgan-anime',
    name: 'ESRGAN Anime',
    description: 'Specialized model for anime and cartoon images with enhanced detail preservation.',
  },
  {
    id: 'lite',
    name: 'Lite',
    description: 'Lightweight model for quick processing with moderate quality improvements.',
  },
];

const OUTPUT_FORMATS = ['PNG', 'JPEG', 'WEBP'];

export function UpscaleOptions({ onUpscale, disabled = false }: UpscaleOptionsProps) {
  const [selectedModel, setSelectedModel] = useState('esrgan');
  const [selectedFormat, setSelectedFormat] = useState('PNG');
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);

  const currentModel = AI_MODELS.find(model => model.id === selectedModel);

  const handleUpscale = () => {
    onUpscale({ model: selectedModel, format: selectedFormat });
  };

  return (
    <div className="w-full max-w-lg bg-surface-container rounded-5xl p-9">
      <div className="space-y-9">
        {/* Title */}
        <h2 className="font-space-grotesk text-2xl font-bold text-white">
          Upscale Options
        </h2>
        
        <div className="space-y-6">
          {/* AI Model Section */}
          <div className="space-y-4">
            <h3 className="font-space-grotesk text-lg font-medium text-white">
              Ai Model
            </h3>
            
            {/* Model Tabs */}
            <div className="bg-background rounded-xl p-1">
              <div className="flex relative">
                {/* Active tab background */}
                <div 
                  className="absolute top-1 h-9 bg-primary rounded-lg transition-all duration-200 ease-out"
                  style={{
                    left: `${AI_MODELS.findIndex(model => model.id === selectedModel) * 33.33}%`,
                    width: '33.33%',
                  }}
                />
                
                {/* Tab buttons */}
                {AI_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`
                      relative z-10 flex-1 py-3 px-4 text-center font-space-grotesk text-base font-medium rounded-lg transition-colors
                      ${selectedModel === model.id ? 'text-white' : 'text-white'}
                    `}
                  >
                    {model.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Model Description */}
            <div className="bg-background rounded-xl p-6">
              <p className="font-space-grotesk text-base text-text-secondary">
                {currentModel?.description}
              </p>
            </div>
          </div>
          
          {/* Output Format Section */}
          <div className="space-y-4">
            <h3 className="font-space-grotesk text-lg font-medium text-white">
              Output Format
            </h3>
            
            {/* Format Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                className="w-full bg-background rounded-xl p-6 flex items-center justify-between"
              >
                <span className="font-space-grotesk text-base font-medium text-white">
                  {selectedFormat}
                </span>
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className={`text-text-muted transition-transform ${showFormatDropdown ? 'rotate-180' : ''}`}
                >
                  <path 
                    fillRule="evenodd" 
                    clipRule="evenodd" 
                    d="M12.707 15.707C12.5194 15.8944 12.2651 15.9998 12 15.9998C11.7348 15.9998 11.4805 15.8944 11.293 15.707L5.63598 10.05C5.54047 9.95773 5.46428 9.84739 5.41188 9.72538C5.35947 9.60338 5.33188 9.47216 5.33073 9.33938C5.32957 9.2066 5.35487 9.07492 5.40516 8.95202C5.45544 8.82913 5.52969 8.71747 5.62358 8.62358C5.71747 8.52969 5.82913 8.45544 5.95202 8.40515C6.07492 8.35487 6.2066 8.32957 6.33938 8.33073C6.47216 8.33188 6.60338 8.35947 6.72538 8.41188C6.84739 8.46428 6.95773 8.54047 7.04998 8.63598L12 13.586L16.95 8.63598C17.1386 8.45382 17.3912 8.35302 17.6534 8.3553C17.9156 8.35758 18.1664 8.46275 18.3518 8.64816C18.5372 8.83357 18.6424 9.08438 18.6447 9.34658C18.6469 9.60877 18.5461 9.86137 18.364 10.05L12.707 15.707Z" 
                    fill="currentColor"
                  />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {showFormatDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-surface-border rounded-xl py-2 z-10">
                  {OUTPUT_FORMATS.map((format) => (
                    <button
                      key={format}
                      onClick={() => {
                        setSelectedFormat(format);
                        setShowFormatDropdown(false);
                      }}
                      className="w-full px-6 py-3 text-left font-space-grotesk text-base text-white hover:bg-surface-container transition-colors"
                    >
                      {format}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Upscale Button */}
          <Button
            onClick={handleUpscale}
            disabled={disabled}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-space-grotesk font-bold text-xl px-6 py-4 rounded-xl flex items-center justify-center gap-2"
          >
            <svg 
              width="25" 
              height="24" 
              viewBox="0 0 25 24" 
              fill="none" 
            >
              <path 
                d="M9.60698 5.448C10.205 3.698 12.623 3.645 13.332 5.289L13.392 5.449L14.199 7.809C14.3839 8.35023 14.6828 8.84551 15.0754 9.26142C15.468 9.67734 15.9453 10.0042 16.475 10.22L16.692 10.301L19.052 11.107C20.802 11.705 20.855 14.123 19.212 14.832L19.052 14.892L16.692 15.699C16.1506 15.8838 15.6551 16.1826 15.239 16.5753C14.8229 16.9679 14.4959 17.4452 14.28 17.975L14.199 18.191L13.393 20.552C12.795 22.302 10.377 22.355 9.66898 20.712L9.60698 20.552L8.80098 18.192C8.61616 17.6506 8.31735 17.1551 7.92472 16.739C7.53209 16.3229 7.05478 15.9959 6.52498 15.78L6.30898 15.699L3.94898 14.893C2.19798 14.295 2.14498 11.877 3.78898 11.169L3.94898 11.107L6.30898 10.301C6.85022 10.1161 7.34549 9.81719 7.76141 9.42457C8.17732 9.03195 8.50419 8.55469 8.71998 8.025L8.80098 7.809L9.60698 5.448ZM11.5 6.094L10.694 8.454C10.4124 9.2793 9.95425 10.0333 9.35152 10.6635C8.74879 11.2937 8.01593 11.7849 7.20398 12.103L6.95398 12.194L4.59398 13L6.95398 13.806C7.77929 14.0876 8.53329 14.5457 9.16348 15.1485C9.79367 15.7512 10.2849 16.4841 10.603 17.296L10.694 17.546L11.5 19.906L12.306 17.546C12.5876 16.7207 13.0457 15.9667 13.6484 15.3365C14.2512 14.7063 14.984 14.2151 15.796 13.897L16.046 13.807L18.406 13L16.046 12.194C15.2207 11.9124 14.4667 11.4543 13.8365 10.8515C13.2063 10.2488 12.7151 9.51595 12.397 8.704L12.307 8.454L11.5 6.094ZM19.5 2C19.6871 2 19.8704 2.05248 20.0291 2.15147C20.1879 2.25046 20.3157 2.392 20.398 2.56L20.446 2.677L20.796 3.703L21.823 4.053C22.0105 4.1167 22.1748 4.23462 22.2952 4.39182C22.4156 4.54902 22.4866 4.73842 22.4993 4.93602C22.5119 5.13362 22.4656 5.33053 22.3662 5.50179C22.2668 5.67304 22.1188 5.81094 21.941 5.898L21.823 5.946L20.797 6.296L20.447 7.323C20.3832 7.51043 20.2652 7.6747 20.1079 7.79499C19.9506 7.91529 19.7612 7.98619 19.5636 7.99872C19.366 8.01125 19.1692 7.96484 18.998 7.86538C18.8268 7.76591 18.689 7.61787 18.602 7.44L18.554 7.323L18.204 6.297L17.177 5.947C16.9895 5.8833 16.8251 5.76538 16.7048 5.60819C16.5844 5.45099 16.5133 5.26158 16.5007 5.06398C16.4881 4.86638 16.5344 4.66947 16.6338 4.49821C16.7332 4.32696 16.8811 4.18906 17.059 4.102L17.177 4.054L18.203 3.704L18.553 2.677C18.6204 2.47943 18.748 2.30791 18.9178 2.1865C19.0876 2.06509 19.2912 1.99987 19.5 2Z" 
                fill="white"
              />
            </svg>
            Upscale Images
          </Button>
        </div>
      </div>
    </div>
  );
}
