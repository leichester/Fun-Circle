import React from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
}

const FormattedText: React.FC<FormattedTextProps> = ({ text, className = '' }) => {
  // Function to parse and render text with formatting
  const renderFormattedText = (text: string) => {
    // Split by **bold** markers
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // This is bold text
        const boldText = part.slice(2, -2); // Remove ** markers
        return (
          <strong key={index} className="font-semibold">
            {boldText}
          </strong>
        );
      } else {
        // Regular text - preserve line breaks
        return part.split('\n').map((line, lineIndex, lines) => (
          <React.Fragment key={`${index}-${lineIndex}`}>
            {line}
            {lineIndex < lines.length - 1 && <br />}
          </React.Fragment>
        ));
      }
    });
  };

  return (
    <div className={className}>
      {renderFormattedText(text)}
    </div>
  );
};

export default FormattedText;
