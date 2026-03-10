import { TMessage } from 'librechat-data-provider';
import { cn } from '~/utils';
import Files from './Files';

const Container = ({ children, message }: { children: React.ReactNode; message?: TMessage }) => (
  <div
    className={cn(
      'text-message message-content-container flex min-h-[20px] flex-col items-start gap-3 overflow-visible [.text-message+&]:mt-5',
    )}
    data-message-content-container
    dir="auto"
  >
    {message?.isCreatedByUser === true && <Files message={message} />}
    {children}
  </div>
);

export default Container;
