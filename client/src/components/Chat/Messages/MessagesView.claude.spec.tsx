import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { RecoilRoot } from 'recoil';
import type { TMessage } from 'librechat-data-provider';
import MessagesView from './MessagesView';
import store from '~/store';

const mockHandleSmoothToRef = jest.fn();
const mockDebouncedHandleScroll = jest.fn();

jest.mock('react-transition-group', () => ({
  CSSTransition: ({
    children,
    in: inProp,
  }: {
    children: React.ReactNode;
    in: boolean;
  }) => (inProp ? <>{children}</> : null),
}));

jest.mock('~/hooks', () => ({
  useScreenshot: () => ({ screenshotTargetRef: { current: null } }),
  useMessageScrolling: () => ({
    conversation: { conversationId: 'conversation-1' },
    scrollableRef: { current: null },
    messagesEndRef: { current: null },
    showScrollButton: false,
    handleSmoothToRef: mockHandleSmoothToRef,
    debouncedHandleScroll: mockDebouncedHandleScroll,
  }),
  useLocalize: () => (key: string) => {
    const map: Record<string, string> = {
      com_ui_nothing_found: 'Nothing found',
    };

    return map[key] ?? key;
  },
}));

jest.mock('~/Providers', () => ({
  MessagesViewProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('~/components/Messages/ScrollToBottom', () => {
  const React = require('react');

  return React.forwardRef(
    (
      { scrollHandler }: { scrollHandler: () => void },
      ref: React.ForwardedRef<HTMLButtonElement>,
    ) => (
      <button ref={ref} data-testid="scroll-to-bottom" onClick={scrollHandler}>
        scroll
      </button>
    ),
  );
});

jest.mock('./MultiMessage', () => () => <div data-testid="multi-message" />);

const messagesTree: TMessage[] = [{ messageId: 'message-1' } as TMessage];

describe('MessagesView claude mode', () => {
  beforeEach(() => {
    mockHandleSmoothToRef.mockReset();
    mockDebouncedHandleScroll.mockReset();
  });

  it('keeps the classic shell by default', () => {
    const { container } = render(
      <RecoilRoot>
        <MessagesView messagesTree={messagesTree} />
      </RecoilRoot>,
    );

    expect(screen.getByTestId('multi-message')).toBeInTheDocument();
    expect(container.querySelector('[data-chat-messages="classic"]')).toBeInTheDocument();
    expect(container.querySelector('.chat-messages-shell')).not.toBeInTheDocument();
  });

  it('applies the Claude message shell when selected', () => {
    const { container } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(store.chatLayoutStyle, 'claude');
        }}
      >
        <MessagesView messagesTree={messagesTree} />
      </RecoilRoot>,
    );

    expect(screen.getByTestId('multi-message')).toBeInTheDocument();
    expect(container.querySelector('[data-chat-messages="claude"]')).toHaveClass(
      'chat-messages-shell',
    );
  });
});
