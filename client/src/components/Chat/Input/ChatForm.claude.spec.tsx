import 'test/matchMedia.mock';

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useForm } from 'react-hook-form';
import { RecoilRoot } from 'recoil';
import ChatForm from './ChatForm';
import { ChatFormProvider } from '~/Providers';
import store from '~/store';

const mockSubmitMessage = jest.fn();
const mockSubmitPrompt = jest.fn();

jest.mock('@librechat/client', () => {
  const React = require('react');

  return {
    TextareaAutosize: React.forwardRef(
      (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>, ref: React.ForwardedRef<HTMLTextAreaElement>) => (
        <textarea ref={ref} {...props} />
      ),
    ),
  };
});

jest.mock('~/hooks', () => ({
  useTextarea: () => ({
    isNotAppendable: false,
    handlePaste: jest.fn(),
    handleKeyDown: jest.fn(),
    handleCompositionStart: jest.fn(),
    handleCompositionEnd: jest.fn(),
  }),
  useAutoSave: jest.fn(),
  useLocalize: () => (key: string) => {
    const map: Record<string, string> = {
      com_ui_message_input: 'Message input',
    };

    return map[key] ?? key;
  },
  useRequiresKey: () => ({ requiresKey: false }),
  useHandleKeyUp: () => jest.fn(),
  useQueryParams: jest.fn(),
  useSubmitMessage: () => ({ submitMessage: mockSubmitMessage, submitPrompt: mockSubmitPrompt }),
  useFocusChatEffect: jest.fn(),
}));

jest.mock('~/Providers', () => {
  const actual = jest.requireActual('~/Providers');

  return {
    ...actual,
    useChatContext: () => ({
      files: [],
      setFiles: jest.fn(),
      conversation: {
        endpoint: 'openAI',
        conversationId: 'conversation-1',
        messages: [],
      },
      isSubmitting: false,
      filesLoading: false,
      newConversation: jest.fn(),
      handleStopGenerating: jest.fn(),
    }),
    useAddedChatContext: () => ({
      generateConversation: jest.fn(),
      conversation: null,
      setConversation: jest.fn(),
    }),
    useAssistantsMapContext: () => ({}),
  };
});

jest.mock('./Files/AttachFileChat', () => () => <button data-testid="attach-file">attach</button>);
jest.mock('./Files/FileFormChat', () => () => null);
jest.mock('./TextareaHeader', () => () => <div data-testid="textarea-header" />);
jest.mock('./PromptsCommand', () => () => null);
jest.mock('./AudioRecorder', () => () => <button data-testid="audio-recorder">audio</button>);
jest.mock('./CollapseChat', () => () => <button data-testid="collapse-chat">collapse</button>);
jest.mock('./StreamAudio', () => () => null);
jest.mock('./StopButton', () => () => <button data-testid="stop-button">stop</button>);
jest.mock('./EditBadges', () => () => null);
jest.mock('./BadgeRow', () => () => <div data-testid="badge-row" />);
jest.mock('./Mention', () => () => null);
jest.mock('./SendButton', () => {
  const React = require('react');

  return React.forwardRef(
    (props: { disabled?: boolean }, ref: React.ForwardedRef<HTMLButtonElement>) => (
      <button ref={ref} data-testid="send-button" disabled={props.disabled}>
        send
      </button>
    ),
  );
});

function Wrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<{ text: string }>({ defaultValues: { text: '' } });

  return (
    <RecoilRoot
      initializeState={({ set }) => {
        set(store.chatLayoutStyle, 'claude');
      }}
    >
      <ChatFormProvider {...methods}>{children}</ChatFormProvider>
    </RecoilRoot>
  );
}

describe('ChatForm claude mode', () => {
  it('renders the composer with send and attachment controls', () => {
    const { container } = render(<ChatForm index={0} />, { wrapper: Wrapper });

    expect(screen.getByTestId('text-input')).toBeInTheDocument();
    expect(screen.getByTestId('attach-file')).toBeInTheDocument();
    expect(screen.getByTestId('send-button')).toBeInTheDocument();
    expect(container.querySelector('[data-chat-composer="claude"]')).toBeInTheDocument();
  });
});
