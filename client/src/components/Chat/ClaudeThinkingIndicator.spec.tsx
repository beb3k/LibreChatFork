import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import type { TConversation, TMessage } from 'librechat-data-provider';
import ClaudeThinkingIndicator from './ClaudeThinkingIndicator';

jest.mock('~/data-provider', () => ({
  useGetEndpointsQuery: () => ({
    data: {},
  }),
}));

jest.mock('~/hooks', () => ({
  useLocalize: () => (key: string, values?: Record<string, string | number>) => {
    const textByKey: Record<string, string> = {
      com_ui_claude_spinner_intro: "Hi, I'm {{0}}. How can I help you today?",
      com_ui_claude_spinner_nudge_1: 'That tickles.',
      com_ui_claude_spinner_nudge_2: "You're very persistent.",
      com_ui_claude_spinner_nudge_3: "I'm trying to focus over here.",
      com_ui_claude_spinner_nudge_4: 'A little gentler, please.',
      com_ui_claude_spinner_nudge_5: "ugh, you can't keep doing that",
    };

    return (textByKey[key] ?? key).replace('{{0}}', String(values?.[0] ?? ''));
  },
}));

const message = {
  messageId: 'assistant-1',
  model: 'claude-sonnet-4-6',
  endpoint: 'anthropic',
} as TMessage;

const conversation = {
  conversationId: 'conversation-1',
  endpoint: 'anthropic',
  modelLabel: 'Claude 4.6',
} as TConversation;

describe('ClaudeThinkingIndicator', () => {
  it('shows the model greeting on hover', async () => {
    const user = userEvent.setup();

    render(
      <ClaudeThinkingIndicator
        message={message}
        conversation={conversation}
        showControls={true}
        controls={<div data-testid="controls-slot" />}
      />,
    );

    await user.hover(screen.getByRole('button'));

    expect(screen.getByRole('tooltip')).toHaveTextContent(
      "Hi, I'm Claude 4.6. How can I help you today?",
    );
  });

  it('cycles through the easter egg messages and loops after the last one', async () => {
    const user = userEvent.setup();

    render(
      <ClaudeThinkingIndicator
        message={message}
        conversation={conversation}
        showControls={false}
      />,
    );

    const button = screen.getByRole('button');

    await user.hover(button);
    await user.click(button);
    expect(screen.getByRole('tooltip')).toHaveTextContent('That tickles.');

    await user.click(button);
    expect(screen.getByRole('tooltip')).toHaveTextContent("You're very persistent.");

    await user.click(button);
    expect(screen.getByRole('tooltip')).toHaveTextContent("I'm trying to focus over here.");

    await user.click(button);
    expect(screen.getByRole('tooltip')).toHaveTextContent('A little gentler, please.');

    await user.click(button);
    expect(screen.getByRole('tooltip')).toHaveTextContent("ugh, you can't keep doing that");

    await user.click(button);
    expect(screen.getByRole('tooltip')).toHaveTextContent('That tickles.');
  });
});
