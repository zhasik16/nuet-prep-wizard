
import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessAnimationProps {
  show: boolean;
  onComplete: () => void;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ show, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 500); // Wait for exit animation
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show && !isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div 
        className={`bg-white rounded-2xl p-8 text-center transform transition-all duration-500 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
      >
        <div className="relative">
          <CheckCircle 
            className={`w-16 h-16 text-green-500 mx-auto mb-4 transition-all duration-1000 ${
              isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
            }`} 
          />
          <div className="absolute inset-0 w-16 h-16 mx-auto">
            <div 
              className={`w-16 h-16 border-4 border-green-500 rounded-full animate-ping ${
                isVisible ? 'opacity-75' : 'opacity-0'
              }`}
            />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
        <p className="text-gray-600">
          Thank you for contacting us. We'll get back to you soon!
        </p>
        
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 bg-green-500 rounded-full animate-bounce ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessAnimation;
