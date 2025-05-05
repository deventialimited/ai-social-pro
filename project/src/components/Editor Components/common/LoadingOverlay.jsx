import { Loader2 } from 'lucide-react';

const LoadingOverlay = () => {
  return (
    <div className="bg-black/50 absolute z-50 inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
        <span className="text-white text-lg font-medium">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingOverlay;