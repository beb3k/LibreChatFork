import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { RecoilRoot } from 'recoil';
import Nav from './Nav';
import store from '~/store';

const mockRefetch = jest.fn();

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial: _initial, animate: _animate, transition: _transition, ...props }: React.HTMLAttributes<HTMLDivElement> & { initial?: boolean; animate?: unknown; transition?: unknown }) => (
      <div {...props}>{children}</div>
    ),
  },
}));

jest.mock('@librechat/client', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
  useMediaQuery: () => false,
}));

jest.mock('~/hooks', () => ({
  useLocalize: () => (key: string) => {
    const map: Record<string, string> = {
      com_ui_chat_history: 'Chat history',
    };

    return map[key] ?? key;
  },
  useHasAccess: () => false,
  useAuthContext: () => ({ isAuthenticated: true }),
  useLocalStorage: (_key: string, initialValue: boolean) => [initialValue, jest.fn()],
  useNavScrolling: () => ({ moveToTop: jest.fn() }),
}));

jest.mock('~/data-provider', () => ({
  useConversationsInfiniteQuery: () => ({
    data: { pages: [{ conversations: [], nextCursor: null }] },
    fetchNextPage: jest.fn(),
    isFetchingNextPage: false,
    isLoading: false,
    isFetching: false,
    refetch: mockRefetch,
  }),
  useTitleGeneration: jest.fn(),
}));

jest.mock('~/components/Conversations', () => ({
  Conversations: () => <div data-testid="conversations" />,
}));

jest.mock('./SearchBar', () => () => <div data-testid="search-bar" />);
jest.mock('./NewChat', () => () => <div data-testid="new-chat" />);
jest.mock('./AccountSettings', () => () => <div data-testid="account-settings" />);

describe('Nav claude mode', () => {
  beforeEach(() => {
    localStorage.clear();
    mockRefetch.mockReset();
  });

  it('keeps the default desktop nav styling in classic mode', async () => {
    const { container, getByTestId } = render(
      <RecoilRoot>
        <Nav navVisible={true} setNavVisible={jest.fn()} />
      </RecoilRoot>,
    );

    await screen.findByTestId('account-settings');

    expect(getByTestId('nav')).not.toHaveClass('chat-sidebar-drawer');
    expect(container.querySelector('.chat-sidebar-shell')).not.toBeInTheDocument();
    expect(container.querySelector('#chat-history-nav')).not.toHaveClass('chat-sidebar-nav');
  });

  it('applies Claude-specific sidebar classes when enabled', async () => {
    const { container, getByTestId } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(store.chatLayoutStyle, 'claude');
        }}
      >
        <Nav navVisible={true} setNavVisible={jest.fn()} />
      </RecoilRoot>,
    );

    await screen.findByTestId('account-settings');

    expect(getByTestId('nav')).toHaveClass('chat-sidebar-drawer');
    expect(container.querySelector('.chat-sidebar-shell')).toBeInTheDocument();
    expect(container.querySelector('#chat-history-nav')).toHaveClass('chat-sidebar-nav');
  });
});
