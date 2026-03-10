import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecoilRoot } from 'recoil';
import MobileNav from './MobileNav';
import store from '~/store';

const mockNewConversation = jest.fn();
const mockClearMessagesCache = jest.fn();

jest.mock('~/hooks', () => ({
  useLocalize: () => (key: string) => {
    const map: Record<string, string> = {
      com_nav_close_sidebar: 'Close sidebar',
      com_nav_open_sidebar: 'Open sidebar',
      com_ui_new_chat: 'New chat',
    };

    return map[key] ?? key;
  },
  useNewConvo: () => ({ newConversation: mockNewConversation }),
}));

jest.mock('~/utils', () => ({
  clearMessagesCache: (...args: unknown[]) => mockClearMessagesCache(...args),
  cn: (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' '),
}));

describe('MobileNav', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNewConversation.mockReset();
    mockClearMessagesCache.mockReset();
  });

  it('keeps mobile navigation controls working in claude mode', () => {
    const setNavVisible = jest.fn();
    const queryClient = new QueryClient();

    const { getByLabelText } = render(
      <QueryClientProvider client={queryClient}>
        <RecoilRoot
          initializeState={({ set }) => {
            set(store.chatLayoutStyle, 'claude');
          }}
        >
          <MobileNav navVisible={false} setNavVisible={setNavVisible} />
        </RecoilRoot>
      </QueryClientProvider>,
    );

    fireEvent.click(getByLabelText('Open sidebar'));
    const updater = setNavVisible.mock.calls[0][0] as (value: boolean) => boolean;
    expect(updater(false)).toBe(true);
    expect(localStorage.getItem('navVisible')).toBe(JSON.stringify(true));

    fireEvent.click(getByLabelText('New chat'));
    expect(mockClearMessagesCache).toHaveBeenCalled();
    expect(mockNewConversation).toHaveBeenCalled();
  });
});
