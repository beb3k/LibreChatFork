import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { RecoilRoot } from 'recoil';
import type { TMessage } from 'librechat-data-provider';
import MessageParts from './MessageParts';
import store from '~/store';

jest.mock('~/hooks', () => ({
  useAttachments: () => ({
    attachments: [],
    searchResults: [],
  }),
  useContentMetadata: () => ({
    hasParallelContent: false,
  }),
  useLocalize: () => (key: string) => key,
  useMessageHelpers: () => ({
    edit: false,
    index: 0,
    agent: null,
    isLast: true,
    enterEdit: jest.fn(),
    assistant: null,
    handleScroll: jest.fn(),
    conversation: {
      conversationId: 'conversation-1',
      endpoint: 'assistants',
      model: 'claude-sonnet-4-6',
    },
    isSubmitting: true,
    latestMessage: {
      messageId: 'assistant-1',
    },
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

jest.mock('~/components/Chat/Messages/MessageIcon', () => ({
  __esModule: true,
  default: () => <div data-testid="message-icon" />,
}));

jest.mock('~/components/Chat/Messages/Content/ContentParts', () => ({
  __esModule: true,
  default: () => <div data-testid="content-parts" />,
}));

jest.mock('./SiblingSwitch', () => ({
  __esModule: true,
  default: () => <div data-testid="sibling-switch" />,
}));

jest.mock('./HoverButtons', () => ({
  __esModule: true,
  default: () => <div data-testid="hover-buttons" />,
}));

jest.mock('./SubRow', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('./MultiMessage', () => ({
  __esModule: true,
  default: () => null,
}));

describe('MessageParts claude spinner', () => {
  it('keeps the Claude thinking indicator visible while an unfinished assistant message is streaming', () => {
    render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(store.chatLayoutStyle, 'claude');
        }}
      >
        <MessageParts
          message={
            {
              messageId: 'assistant-1',
              endpoint: 'assistants',
              isCreatedByUser: false,
              unfinished: true,
              error: false,
              content: [],
            } as TMessage
          }
          siblingIdx={0}
          siblingCount={1}
          setSiblingIdx={jest.fn()}
          currentEditId={null}
          setCurrentEditId={jest.fn()}
        />
      </RecoilRoot>,
    );

    expect(screen.getByTestId('claude-thinking-indicator')).toHaveAttribute(
      'data-show-controls',
      'false',
    );
    expect(screen.queryByTestId('hover-buttons')).not.toBeInTheDocument();
  });
});
