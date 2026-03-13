import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { RecoilRoot } from 'recoil';
import EmptyTextPart from './EmptyText';
import store from '~/store';

describe('EmptyTextPart claude spinner', () => {
  it('renders the Claude spinner instead of a blank spacer in Claude layout', () => {
    const { container } = render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(store.chatLayoutStyle, 'claude');
        }}
      >
        <EmptyTextPart />
      </RecoilRoot>,
    );

    expect(container.querySelector('.claude-thinking-spinner')).toBeInTheDocument();
    expect(container.querySelector('.result-thinking')).not.toBeInTheDocument();
  });
});
