import type { CSSProperties } from 'react';
import { cn } from '~/utils';

const petals = Array.from({ length: 12 }, (_, index) => index);

type ClaudeThinkingSpinnerProps = {
  className?: string;
  variant?: 'inline' | 'page';
};

export default function ClaudeThinkingSpinner({
  className,
  variant = 'inline',
}: ClaudeThinkingSpinnerProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'claude-thinking-spinner',
        variant === 'page' && 'claude-thinking-spinner-page',
        className,
      )}
    >
      {petals.map((index) => {
        const style = {
          '--claude-spinner-delay': `${index * -0.085}s`,
          '--claude-spinner-rotation': `${index * 30}deg`,
        } as CSSProperties;

        return (
          <span
            key={`claude-spinner-petal-${index}`}
            className="claude-thinking-spinner__petal"
            style={style}
          />
        );
      })}
    </span>
  );
}
