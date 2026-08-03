export const ProgressBar = ({ percentage = 0 }) => {
  const safePercentage = Math.min(100, Math.max(0, Number(percentage) || 0));
  const isComplete = safePercentage === 100;
 
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs font-medium text-gray-600">
        <span>Progress</span>
        <span aria-hidden="true">{safePercentage}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={safePercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Course completion progress"
        className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isComplete ? 'bg-green-500' : 'bg-indigo-600'
          }`}
          style={{ width: `${safePercentage}%` }}
        />
      </div>
    </div>
  );
};
 export default ProgressBar;