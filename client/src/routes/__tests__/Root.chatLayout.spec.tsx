import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { RecoilRoot } from 'recoil';
import Root from '../Root';
import store from '~/store';

jest.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet" />,
}));

jest.mock('@librechat/client', () => ({
  useMediaQuery: () => false,
}));

jest.mock('~/hooks', () => ({
  useSearchEnabled: jest.fn(),
  useAssistantsMap: () => ({}),
  useAuthContext: () => ({ isAuthenticated: true, logout: jest.fn() }),
  useAgentsMap: () => ({}),
  useFileMap: () => ({}),
}));

jest.mock('~/Providers', () => {
  const PassThrough = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  const providerValue = { Provider: PassThrough };

  return {
    PromptGroupsProvider: PassThrough,
    AssistantsMapContext: providerValue,
    AgentsMapContext: providerValue,
    SetConvoProvider: PassThrough,
    FileMapContext: providerValue,
  };
});

jest.mock('~/data-provider', () => ({
  useUserTermsQuery: () => ({ data: { termsAccepted: true } }),
  useGetStartupConfig: () => ({ data: { interface: {} } }),
  useHealthCheck: jest.fn(),
}));

jest.mock('~/components/Nav', () => ({
  NAV_WIDTH: { MOBILE: 320, DESKTOP: 260 },
  Nav: () => <div data-testid="nav" />,
  MobileNav: () => <div data-testid="mobile-nav" />,
}));

jest.mock('~/components/ui', () => ({
  TermsAndConditionsModal: () => null,
}));

jest.mock('~/components/Banners', () => ({
  Banner: () => null,
}));

describe('Root chat layout marker', () => {
  it('applies classic layout by default', () => {
    const { getByTestId } = render(
      <RecoilRoot>
        <Root />
      </RecoilRoot>,
    );

    expect(getByTestId('chat-shell')).toHaveAttribute('data-chat-layout', 'classic');
  });

  it('applies the claude layout marker when selected', () => {
    const { getByTestId } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(store.chatLayoutStyle, 'claude');
        }}
      >
        <Root />
      </RecoilRoot>,
    );

    expect(getByTestId('chat-shell')).toHaveAttribute('data-chat-layout', 'claude');
  });
});
