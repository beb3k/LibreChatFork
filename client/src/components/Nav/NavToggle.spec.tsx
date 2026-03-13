import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { RecoilRoot } from 'recoil';
import NavToggle from './NavToggle';
import store from '~/store';

jest.mock('@librechat/client', () => ({
  TooltipAnchor: ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
}));

jest.mock('~/hooks', () => ({
  useLocalize: () => (key: string, values?: Record<string, string | number>) => {
    const textByKey: Record<string, string> = {
      com_ui_chat_history: 'Chat history',
      com_nav_control_panel: 'Control Panel',
      com_ui_open_var: 'Open {{0}}',
      com_ui_close_var: 'Close {{0}}',
    };

    return (textByKey[key] ?? key).replace('{{0}}', String(values?.[0] ?? ''));
  },
}));

describe('NavToggle', () => {
  it('adds the Claude right-panel contrast classes in Claude layout', () => {
    const { container } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(store.chatLayoutStyle, 'claude');
        }}
      >
        <NavToggle
          side="right"
          navVisible={false}
          isHovering={false}
          onToggle={jest.fn()}
          setIsHovering={jest.fn()}
        />
      </RecoilRoot>,
    );

    expect(screen.getByRole('button')).toHaveClass('chat-side-panel-toggle');
    expect(container.querySelectorAll('.chat-side-panel-toggle__bar')).toHaveLength(2);
  });

  it('keeps the default styling in classic layout', () => {
    const { container } = render(
      <RecoilRoot>
        <NavToggle
          side="right"
          navVisible={false}
          isHovering={false}
          onToggle={jest.fn()}
          setIsHovering={jest.fn()}
        />
      </RecoilRoot>,
    );

    expect(screen.getByRole('button')).not.toHaveClass('chat-side-panel-toggle');
    expect(container.querySelector('.chat-side-panel-toggle__bar')).not.toBeInTheDocument();
  });
});
