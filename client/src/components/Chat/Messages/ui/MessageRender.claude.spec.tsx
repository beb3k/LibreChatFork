import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { RecoilRoot } from 'recoil';
import type { TMessage } from 'librechat-data-provider';
import MessageRender from './MessageRender';
import store from '~/store';

jest.mock('~/hooks', () => ({
  useContentMetadata: () => ({
    hasParallelContent: false,
  }),
  useLocalize: () => (key: string) => key,
  useMessageActions: () => ({
    ask: '',
    edit: false,
    index: 0,
    agent: null,
    assistant: null,
    enterEdit: jest.fn(),
    conversation: {
      conversationId: 'conversation-1',
      endpoint: 'anthropic',
      model: 'claude-sonnet-4-6',
    },
    messageLabel: 'Claude',
    latestMessage: {
      messageId: 'assistant-1',
      depth: 0,
    },
    handleFeedback: jest.fn(),
    handleContinue: jest.fn(),
    copyToClipboard: jest.fn(),
    regenerateMessage: jest.fn(),
  }),
}));

jest.mock('~/components/Chat/ClaudeThinkingIndicator', () => ({
  __esModule: true,
  default: ({ showControls }: { showControls: boolean }) => (
    <div data-show-controls={String(showControls)} data-testid="claude-thinking-indicator" />
  ),
}));

jest.mock('~/components/Chat/Messages/Content/MessageContent', () => ({
  __esModule: true,
  default: () => <div data-testid="message-content" />,
}));

jest.mock('~/components/Chat/Messages/ui/PlaceholderRow', () => ({
  __esModule: true,
  default: () => <div data-testid="placeholder-row" />,
}));

jest.mock('~/components/Chat/Messages/MessageIcon', () => ({
  __esModule: true,
  default: () => <div data-testid="message-icon" />,
}));

jest.mock('~/components/Chat/Messages/SiblingSwitch', () => ({
  __esModule: true,
  default: () => <div data-testid="sibling-switch" />,
}));

jest.mock('~/components/Chat/Messages/HoverButtons', () => ({
  __esModule: true,
  default: () => <div data-testid="hover-buttons" />,
}));

jest.mock('~/components/Chat/Messages/SubRow', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('MessageRender claude spinner', () => {
  it('keeps the Claude thinking indicator visible while an unfinished assistant message is streaming', () => {
    render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(store.chatLayoutStyle, 'claude');
        }}
      >
        <MessageRender
          message={
            {
              messageId: 'assistant-1',
              endpoint: 'anthropic',
              isCreatedByUser: false,
              unfinished: true,
              error: false,
              depth: 0,
              children: [],
              text: '',
            } as TMessage
          }
          siblingIdx={0}
          siblingCount={1}
          setSiblingIdx={jest.fn()}
          currentEditId={null}
          setCurrentEditId={jest.fn()}
          isSubmitting={true}
        />
      </RecoilRoot>,
    );

    expect(screen.getByTestId('claude-thinking-indicator')).toHaveAttribute(
      'data-show-controls',
      'false',
    );
    expect(screen.queryByTestId('placeholder-row')).not.toBeInTheDocument();
  });
});
