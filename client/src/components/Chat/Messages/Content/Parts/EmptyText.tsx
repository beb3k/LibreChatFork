import { memo } from 'react';
import { useRecoilValue } from 'recoil';
import ClaudeThinkingSpinner from '~/components/Chat/ClaudeThinkingSpinner';
import store from '~/store';

const EmptyTextPart = memo(() => {
  const chatLayoutStyle = useRecoilValue(store.chatLayoutStyle);

  return (
    <div className="text-message mb-[0.625rem] flex min-h-[20px] flex-col items-start gap-3 overflow-visible">
      <div className="markdown prose dark:prose-invert light w-full break-words dark:text-gray-100">
        {chatLayoutStyle === 'claude' ? (
          <div className="flex min-h-[2.25rem] items-center" aria-hidden="true">
            <ClaudeThinkingSpinner />
          </div>
        ) : (
          <div className="absolute">
            <p className="submitting relative">
              <span className="result-thinking" />
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

export default EmptyTextPart;
