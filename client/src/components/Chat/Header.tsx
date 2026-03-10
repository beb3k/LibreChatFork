import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { useMediaQuery } from '@librechat/client';
import { useOutletContext } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { getConfigDefaults, PermissionTypes, Permissions } from 'librechat-data-provider';
import type { ContextType } from '~/common';
import { PresetsMenu, HeaderNewChat, OpenSidebar } from './Menus';
import ModelSelector from './Menus/Endpoints/ModelSelector';
import { useGetStartupConfig } from '~/data-provider';
import ExportAndShareMenu from './ExportAndShareMenu';
import BookmarkMenu from './Menus/BookmarkMenu';
import { TemporaryChat } from './TemporaryChat';
import AddMultiConvo from './AddMultiConvo';
import { useHasAccess } from '~/hooks';
import { cn } from '~/utils';
import store from '~/store';

const defaultInterface = getConfigDefaults().interface;

export default function Header() {
  const { data: startupConfig } = useGetStartupConfig();
  const { navVisible, setNavVisible } = useOutletContext<ContextType>();
  const chatLayoutStyle = useRecoilValue(store.chatLayoutStyle);

  const interfaceConfig = useMemo(
    () => startupConfig?.interface ?? defaultInterface,
    [startupConfig],
  );

  const hasAccessToBookmarks = useHasAccess({
    permissionType: PermissionTypes.BOOKMARKS,
    permission: Permissions.USE,
  });

  const hasAccessToMultiConvo = useHasAccess({
    permissionType: PermissionTypes.MULTI_CONVO,
    permission: Permissions.USE,
  });

  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  return (
    <div
      className={cn(
        'absolute top-0 z-10 flex w-full items-center justify-between p-2 font-semibold text-text-primary',
        chatLayoutStyle === 'claude'
          ? 'h-12 bg-gradient-to-b from-presentation via-presentation/85 to-transparent'
          : 'via-presentation/70 h-14 bg-gradient-to-b from-presentation to-transparent md:from-presentation/80 md:via-presentation/50 2xl:from-presentation/0 2xl:via-transparent',
      )}
      data-chat-header={chatLayoutStyle}
    >
      <div className="hide-scrollbar flex w-full items-center justify-between gap-2 overflow-x-auto">
        <div className="mx-1 flex items-center">
          <AnimatePresence initial={false}>
            {!navVisible && (
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                key="header-buttons"
              >
                <OpenSidebar setNavVisible={setNavVisible} className="max-md:hidden" />
                <HeaderNewChat />
              </motion.div>
            )}
          </AnimatePresence>
          {!(navVisible && isSmallScreen) && (
            <div
              className={cn(
                'flex items-center gap-2',
                !isSmallScreen ? 'transition-all duration-200 ease-in-out' : '',
                !navVisible && !isSmallScreen ? 'pl-2' : '',
                chatLayoutStyle === 'claude' && 'gap-1.5',
              )}
            >
              <ModelSelector startupConfig={startupConfig} />
              {interfaceConfig.presets === true && interfaceConfig.modelSelect && <PresetsMenu />}
              {hasAccessToBookmarks === true && <BookmarkMenu />}
              {hasAccessToMultiConvo === true && <AddMultiConvo />}
              {isSmallScreen && (
                <>
                  <ExportAndShareMenu
                    isSharedButtonEnabled={startupConfig?.sharedLinksEnabled ?? false}
                  />
                  <TemporaryChat />
                </>
              )}
            </div>
          )}
        </div>

        {!isSmallScreen && (
          <div className={cn('flex items-center gap-2', chatLayoutStyle === 'claude' && 'gap-1.5')}>
            <ExportAndShareMenu
              isSharedButtonEnabled={startupConfig?.sharedLinksEnabled ?? false}
            />
            <TemporaryChat />
          </div>
        )}
      </div>
      <div />
    </div>
  );
}
