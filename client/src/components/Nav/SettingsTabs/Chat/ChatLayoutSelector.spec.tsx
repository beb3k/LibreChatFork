import 'test/matchMedia.mock';

import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { RecoilRoot } from 'recoil';
import ChatLayoutSelector from './ChatLayoutSelector';

jest.mock('@librechat/client', () => ({
  Dropdown: ({
    'aria-labelledby': ariaLabelledby,
    onChange,
    options,
    testId,
    value,
  }: {
    'aria-labelledby'?: string;
    onChange: (value: string) => void;
    options: Array<{ label: string; value: string }>;
    testId: string;
    value: string;
  }) => (
    <select
      aria-labelledby={ariaLabelledby}
      data-testid={testId}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

jest.mock('~/hooks', () => ({
  useLocalize: () => (key: string) => {
    const map: Record<string, string> = {
      com_nav_chat_layout_style: 'Chat Layout',
      com_nav_chat_layout_style_desc: 'Layout description',
      com_nav_chat_layout_style_classic: 'Classic',
      com_nav_chat_layout_style_claude: 'Claude',
    };

    return map[key] ?? key;
  },
}));

describe('ChatLayoutSelector', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the persisted classic value by default', () => {
    const { getByText, getByTestId } = render(
      <RecoilRoot>
        <ChatLayoutSelector />
      </RecoilRoot>,
    );

    expect(getByText('Chat Layout')).toBeInTheDocument();
    expect(getByTestId('chat-layout-style-selector')).toHaveValue('classic');
  });

  it('updates the layout selection and persists it to localStorage', async () => {
    const { getByTestId } = render(
      <RecoilRoot>
        <ChatLayoutSelector />
      </RecoilRoot>,
    );

    fireEvent.change(getByTestId('chat-layout-style-selector'), { target: { value: 'claude' } });

    await waitFor(() => {
      expect(localStorage.getItem('chatLayoutStyle')).toBe(JSON.stringify('claude'));
    });
  });
});
