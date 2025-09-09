import React, { useState, useRef } from 'react';

interface SimpleRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  rows?: number;
}

const SimpleRichTextEditor: React.FC<SimpleRichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  className,
  required,
  rows = 4
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Common emojis for quick access
  const commonEmojis = [
    '😊', '😍', '🤗', '👍', '👌', '💪', '🙌', '👏',
    '❤️', '💙', '💚', '💛', '🧡', '💜', '💖', '✨',
    '🔥', '⭐', '🎉', '🎊', '🎈', '🎁', '🏆', '💯',
    '👍', '👎', '🆕', '🆒', '🆓', '💥', '💦', '💨'
  ];

  const insertText = (textToInsert: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value;

    const newValue = currentValue.substring(0, start) + textToInsert + currentValue.substring(end);
    onChange(newValue);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toggleBold = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    if (selectedText) {
      // If text is selected, wrap it with bold
      insertText(`**${selectedText}**`);
    } else {
      // If no text selected, insert bold placeholder
      insertText('**bold text**');
    }
  };

  const insertEmoji = (emoji: string) => {
    insertText(emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="relative">
      {/* Formatting Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-300 rounded-t-lg border-b-0">
        <button
          type="button"
          onClick={toggleBold}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          title="Bold (wrap with **text**)"
        >
          <span className="font-bold">B</span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            title="Insert Emoji"
          >
            😊
          </button>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-1 p-3 bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-64">
              <div className="grid grid-cols-8 gap-1 mb-2">
                {commonEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="p-1 hover:bg-gray-100 rounded text-lg"
                    title={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-500 text-center">
                Click an emoji to insert it
              </div>
            </div>
          )}
        </div>

        <div className="flex-1" />

        <div className="text-xs text-gray-500">
          **text** for bold • emojis supported
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${className} rounded-t-none`}
        required={required}
        rows={rows}
      />

      {/* Click outside to close emoji picker */}
      {showEmojiPicker && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
};

export default SimpleRichTextEditor;
