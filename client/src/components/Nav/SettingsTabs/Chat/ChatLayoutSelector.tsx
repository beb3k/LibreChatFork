import { useRecoilState } from 'recoil';
import { Dropdown } from '@librechat/client';
import { useLocalize } from '~/hooks';
import store from '~/store';

const options = [
  { value: 'classic', key: 'com_nav_chat_layout_style_classic' as const },
  { value: 'claude', key: 'com_nav_chat_layout_style_claude' as const },
];

export default function ChatLayoutSelector() {
  const localize = useLocalize();
  const [chatLayoutStyle, setChatLayoutStyle] = useRecoilState(store.chatLayoutStyle);

  return (
    <div className="flex w-full items-start justify-between gap-4">
      <div className="flex flex-col">
        <div id="chat-layout-style-label">{localize('com_nav_chat_layout_style')}</div>
        <p className="mt-1 text-xs text-text-secondary">
          {localize('com_nav_chat_layout_style_desc')}
        </p>
      </div>
      <Dropdown
        value={chatLayoutStyle}
        options={options.map((option) => ({
          value: option.value,
          label: localize(option.key),
        }))}
        onChange={setChatLayoutStyle}
        testId="chat-layout-style-selector"
        sizeClasses="w-[150px]"
        className="z-50"
        aria-labelledby="chat-layout-style-label"
      />
    </div>
  );
}
