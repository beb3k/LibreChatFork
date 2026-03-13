import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { getResponseSender } from 'librechat-data-provider';
import type { ReactNode } from 'react';
import type { TConversation, TEndpointsConfig, TMessage } from 'librechat-data-provider';
import { useGetEndpointsQuery } from '~/data-provider';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';
import ClaudeThinkingSpinner from './ClaudeThinkingSpinner';

const annoyedMessageKeys = [
  'com_ui_claude_spinner_nudge_1',
  'com_ui_claude_spinner_nudge_2',
  'com_ui_claude_spinner_nudge_3',
  'com_ui_claude_spinner_nudge_4',
  'com_ui_claude_spinner_nudge_5',
] as const;

type ClaudeThinkingIndicatorProps = {
  message: TMessage;
  conversation?: TConversation | null;
  controls?: ReactNode;
  showControls: boolean;
  children?: ReactNode;
};

const contentToFooterGap = 4;
const controlsToIndicatorGap = 8;
const defaultIndicatorHeight = 36;

const resolveModelName = ({
  message,
  conversation,
  endpointsConfig,
}: {
  message: TMessage;
  conversation?: TConversation | null;
  endpointsConfig?: TEndpointsConfig;
}) => {
  const endpoint = message.endpoint ?? conversation?.endpoint ?? '';
  const configuredLabel = endpoint ? endpointsConfig?.[endpoint]?.modelDisplayLabel?.trim() : '';
  const fallbackSender = getResponseSender({
    endpoint: message.endpoint ?? conversation?.endpoint,
    endpointType: conversation?.endpointType,
    model: message.model ?? conversation?.model,
    modelDisplayLabel: configuredLabel,
    modelLabel: conversation?.modelLabel,
    chatGptLabel: conversation?.chatGptLabel,
  }).trim();

  return (
    conversation?.modelLabel?.trim() ||
    conversation?.chatGptLabel?.trim() ||
    configuredLabel ||
    message.model?.trim() ||
    conversation?.model?.trim() ||
    fallbackSender ||
    'AI'
  );
};

export default function ClaudeThinkingIndicator({
  message,
  conversation,
  controls,
  showControls,
  children,
}: ClaudeThinkingIndicatorProps) {
  const localize = useLocalize();
  const tooltipId = useId();
  const { data: endpointsConfig = {} as TEndpointsConfig } = useGetEndpointsQuery();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [easterEggIndex, setEasterEggIndex] = useState<number | null>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [controlsHeight, setControlsHeight] = useState(0);
  const [indicatorHeight, setIndicatorHeight] = useState(defaultIndicatorHeight);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseFrameRef = useRef<number | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  const modelName = useMemo(
    () => resolveModelName({ message, conversation, endpointsConfig }),
    [conversation, endpointsConfig, message],
  );

  const tooltipMessages = useMemo(
    () => [
      localize('com_ui_claude_spinner_intro', { 0: modelName }),
      ...annoyedMessageKeys.map((key) => localize(key, { 0: modelName })),
    ],
    [localize, modelName],
  );

  const activeMessage = useMemo(() => {
    if (easterEggIndex == null) {
      return tooltipMessages[0];
    }

    const loopLength = tooltipMessages.length - 1;
    return tooltipMessages[(easterEggIndex % loopLength) + 1];
  }, [easterEggIndex, tooltipMessages]);

  const isTooltipVisible = isHovered || isFocused || isPinned;
  const indicatorOffset =
    contentHeight +
    contentToFooterGap +
    controlsHeight +
    (controlsHeight > 0 ? controlsToIndicatorGap : 0);
  const spacerMarginTop = controlsHeight > 0 ? controlsToIndicatorGap : 0;

  const measureDock = useCallback(() => {
    setContentHeight(contentRef.current?.offsetHeight ?? 0);
    setControlsHeight(controlsRef.current?.offsetHeight ?? 0);
    setIndicatorHeight(indicatorRef.current?.offsetHeight ?? defaultIndicatorHeight);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current != null) {
        clearTimeout(hideTimerRef.current);
      }
      if (pulseTimerRef.current != null) {
        clearTimeout(pulseTimerRef.current);
      }
      if (pulseFrameRef.current != null) {
        cancelAnimationFrame(pulseFrameRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    measureDock();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(() => {
      measureDock();
    });
    const observedNodes = [contentRef.current, controlsRef.current, indicatorRef.current];

    observedNodes.forEach((node) => {
      if (node) {
        resizeObserver.observe(node);
      }
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, [measureDock, showControls, children, controls]);

  const pinTooltip = () => {
    if (hideTimerRef.current != null) {
      clearTimeout(hideTimerRef.current);
    }

    setIsPinned(true);
    hideTimerRef.current = setTimeout(() => {
      setIsPinned(false);
    }, 1800);
  };

  const triggerPulse = () => {
    if (pulseTimerRef.current != null) {
      clearTimeout(pulseTimerRef.current);
    }
    if (pulseFrameRef.current != null) {
      cancelAnimationFrame(pulseFrameRef.current);
    }

    setIsPulsing(false);
    pulseFrameRef.current = requestAnimationFrame(() => {
      setIsPulsing(true);
      pulseTimerRef.current = setTimeout(() => {
        setIsPulsing(false);
      }, 420);
    });
  };

  const handleClick = () => {
    setEasterEggIndex((current) => {
      if (current == null) {
        return 0;
      }

      return (current + 1) % (tooltipMessages.length - 1);
    });
    triggerPulse();
    pinTooltip();
  };

  return (
    <div className="claude-thinking-indicator-stack">
      {children != null && (
        <div ref={contentRef} className="claude-thinking-indicator__content">
          {children}
        </div>
      )}
      <div className="claude-thinking-indicator__footer" style={{ marginTop: contentToFooterGap }}>
        <div
          ref={controlsRef}
          className={cn(
            'claude-thinking-indicator__controls',
            showControls
              ? 'claude-thinking-indicator__controls--open'
              : 'claude-thinking-indicator__controls--closed',
          )}
        >
          {controls}
        </div>
        <div
          aria-hidden="true"
          className="claude-thinking-indicator__spacer"
          style={{ height: indicatorHeight, marginTop: spacerMarginTop }}
        />
      </div>
      <div
        ref={indicatorRef}
        className="claude-thinking-indicator"
        data-streaming={showControls ? 'false' : 'true'}
        style={{ transform: `translateY(${indicatorOffset}px)` }}
      >
        <div className="claude-thinking-indicator__inner">
          <button
            type="button"
            aria-label={activeMessage}
            aria-describedby={isTooltipVisible ? tooltipId : undefined}
            className={cn(
              'claude-thinking-indicator__button',
              isPulsing && 'claude-thinking-indicator__button--pulse',
            )}
            onClick={handleClick}
            onBlur={() => setIsFocused(false)}
            onFocus={() => setIsFocused(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <ClaudeThinkingSpinner />
          </button>
          <div
            id={tooltipId}
            role="tooltip"
            aria-hidden={!isTooltipVisible}
            className={cn(
              'claude-thinking-indicator__tooltip',
              isTooltipVisible && 'claude-thinking-indicator__tooltip--visible',
            )}
          >
            {activeMessage}
          </div>
        </div>
      </div>
    </div>
  );
}
