import React, { useCallback, useMemo, memo } from 'react';
import { useAtomValue } from 'jotai';
import { useRecoilValue } from 'recoil';
import { type TMessage } from 'librechat-data-provider';
import type { TMessageProps, TMessageIcon } from '~/common';
import ClaudeThinkingIndicator from '~/components/Chat/ClaudeThinkingIndicator';
import MessageContent from '~/components/Chat/Messages/Content/MessageContent';
import PlaceholderRow from '~/components/Chat/Messages/ui/PlaceholderRow';
import SiblingSwitch from '~/components/Chat/Messages/SiblingSwitch';
import HoverButtons from '~/components/Chat/Messages/HoverButtons';
import MessageIcon from '~/components/Chat/Messages/MessageIcon';
import { useLocalize, useMessageActions, useContentMetadata } from '~/hooks';
import SubRow from '~/components/Chat/Messages/SubRow';
import { cn, getMessageAriaLabel } from '~/utils';
import { fontSizeAtom } from '~/store/fontSize';
import { MessageContext } from '~/Providers';
import store from '~/store';

type MessageRenderProps = {
  message?: TMessage;
  isSubmitting?: boolean;
} & Pick<
  TMessageProps,
  'currentEditId' | 'setCurrentEditId' | 'siblingIdx' | 'setSiblingIdx' | 'siblingCount'
>;

const MessageRender = memo(
  ({
    message: msg,
    siblingIdx,
    siblingCount,
    setSiblingIdx,
    currentEditId,
    setCurrentEditId,
    isSubmitting = false,
  }: MessageRenderProps) => {
    const localize = useLocalize();
    const {
      ask,
      edit,
      index,
      agent,
      assistant,
      enterEdit,
      conversation,
      messageLabel,
      latestMessage,
      handleFeedback,
      handleContinue,
      copyToClipboard,
      regenerateMessage,
    } = useMessageActions({
      message: msg,
      currentEditId,
      setCurrentEditId,
    });
    const fontSize = useAtomValue(fontSizeAtom);
    const maximizeChatSpace = useRecoilValue(store.maximizeChatSpace);
    const chatLayoutStyle = useRecoilValue(store.chatLayoutStyle);

    const handleRegenerateMessage = useCallback(() => regenerateMessage(), [regenerateMessage]);
    const hasNoChildren = !(msg?.children?.length ?? 0);
    const isLast = useMemo(
      () => hasNoChildren && (msg?.depth === latestMessage?.depth || msg?.depth === -1),
      [hasNoChildren, msg?.depth, latestMessage?.depth],
    );
    const isLatestMessage = msg?.messageId === latestMessage?.messageId;
    const effectiveIsSubmitting = isLatestMessage ? isSubmitting : false;

    const iconData: TMessageIcon = useMemo(
      () => ({
        endpoint: msg?.endpoint ?? conversation?.endpoint,
        model: msg?.model ?? conversation?.model,
        iconURL: msg?.iconURL,
        modelLabel: messageLabel,
        isCreatedByUser: msg?.isCreatedByUser,
      }),
      [
        messageLabel,
        conversation?.endpoint,
        conversation?.model,
        msg?.model,
        msg?.iconURL,
        msg?.endpoint,
        msg?.isCreatedByUser,
      ],
    );

    const { hasParallelContent } = useContentMetadata(msg);
    const showClaudeThinkingIndicator =
      chatLayoutStyle === 'claude' &&
      msg?.isCreatedByUser !== true &&
      !hasParallelContent &&
      !(msg?.error ?? false);
    const showActionRow = !(hasNoChildren && effectiveIsSubmitting);

    if (!msg) {
      return null;
    }

    const getChatWidthClass = () => {
      if (chatLayoutStyle === 'claude' && !hasParallelContent) {
        return 'max-w-[48rem] px-4 md:px-0';
      }
      if (maximizeChatSpace) {
        return 'w-full max-w-full md:px-5 lg:px-1 xl:px-5';
      }
      if (hasParallelContent) {
        return 'md:max-w-[58rem] xl:max-w-[70rem]';
      }
      return 'md:max-w-[47rem] xl:max-w-[55rem]';
    };

    const actionRow = (
      <SubRow classes="text-xs">
        <SiblingSwitch
          siblingIdx={siblingIdx}
          siblingCount={siblingCount}
          setSiblingIdx={setSiblingIdx}
        />
        <HoverButtons
          index={index}
          isEditing={edit}
          message={msg}
          enterEdit={enterEdit}
          isSubmitting={isSubmitting}
          conversation={conversation ?? null}
          regenerate={handleRegenerateMessage}
          copyToClipboard={copyToClipboard}
          handleContinue={handleContinue}
          latestMessage={latestMessage}
          handleFeedback={handleFeedback}
          isLast={isLast}
        />
      </SubRow>
    );
    const contentSection = (
      <div className="flex max-w-full flex-grow flex-col gap-0">
        <MessageContext.Provider
          value={{
            messageId: msg.messageId,
            conversationId: conversation?.conversationId,
            isExpanded: false,
            isSubmitting: effectiveIsSubmitting,
            isLatestMessage,
          }}
        >
          <MessageContent
            ask={ask}
            edit={edit}
            isLast={isLast}
            text={msg.text || ''}
            message={msg}
            enterEdit={enterEdit}
            error={!!(msg.error ?? false)}
            isSubmitting={effectiveIsSubmitting}
            unfinished={msg.unfinished ?? false}
            isCreatedByUser={msg.isCreatedByUser ?? true}
            siblingIdx={siblingIdx ?? 0}
            setSiblingIdx={setSiblingIdx ?? (() => ({}))}
          />
        </MessageContext.Provider>
      </div>
    );

    return (
      <div
        id={msg.messageId}
        aria-label={getMessageAriaLabel(msg, localize)}
        className={cn(
          'message-render group mx-auto flex flex-1 gap-3 transition-all duration-200',
          getChatWidthClass(),
          'focus:outline-none focus:ring-2 focus:ring-border-xheavy',
          chatLayoutStyle === 'claude' && 'chat-message-row',
          chatLayoutStyle === 'claude' &&
            (msg.isCreatedByUser ? 'chat-message-row-user' : 'chat-message-row-assistant'),
        )}
      >
        {!hasParallelContent && (
          <div className="relative flex flex-shrink-0 flex-col items-center" data-message-avatar>
            <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full">
              <MessageIcon iconData={iconData} assistant={assistant} agent={agent} />
            </div>
          </div>
        )}

        <div
          className={cn(
            'relative flex flex-col',
            hasParallelContent ? 'w-full' : 'w-11/12',
            msg.isCreatedByUser ? 'user-turn' : 'agent-turn',
          )}
          data-message-body
          data-message-role={msg.isCreatedByUser ? 'user' : 'assistant'}
        >
          {!hasParallelContent && (
            <h2 className={cn('select-none font-semibold', fontSize)} data-message-title>
              {messageLabel}
            </h2>
          )}

          {showClaudeThinkingIndicator ? (
            <ClaudeThinkingIndicator
              message={msg}
              conversation={conversation ?? null}
              showControls={showActionRow}
              controls={actionRow}
            >
              {contentSection}
            </ClaudeThinkingIndicator>
          ) : (
            <div className="flex flex-col gap-1">
              {contentSection}
              {showActionRow ? actionRow : <PlaceholderRow />}
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default MessageRender;
