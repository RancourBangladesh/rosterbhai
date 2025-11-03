export default function Logo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Modern calendar icon with clean lines */}
      <rect 
        x="20" 
        y="28" 
        width="60" 
        height="52" 
        rx="6" 
        fill="#4F46E5" 
        opacity="0.1"
      />
      <rect 
        x="20" 
        y="28" 
        width="60" 
        height="52" 
        rx="6" 
        stroke="#4F46E5" 
        strokeWidth="2.5"
      />
      
      {/* Calendar header bar */}
      <rect 
        x="20" 
        y="28" 
        width="60" 
        height="12" 
        fill="#4F46E5"
        rx="6"
        style={{ clipPath: 'inset(0 0 50% 0)' }}
      />
      
      {/* Calendar rings */}
      <rect x="32" y="22" width="4" height="10" rx="2" fill="#4F46E5"/>
      <rect x="64" y="22" width="4" height="10" rx="2" fill="#4F46E5"/>
      
      {/* Grid dots representing schedule */}
      <circle cx="34" cy="52" r="2.5" fill="#4F46E5"/>
      <circle cx="50" cy="52" r="2.5" fill="#4F46E5"/>
      <circle cx="66" cy="52" r="2.5" fill="#4F46E5"/>
      
      <circle cx="34" cy="64" r="2.5" fill="#4F46E5"/>
      <circle cx="50" cy="64" r="2.5" fill="#4F46E5"/>
      <circle cx="66" cy="64" r="2.5" fill="#4F46E5"/>
    </svg>
  );
}
