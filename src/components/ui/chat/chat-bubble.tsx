// chat-bubble.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";
import MessageLoading from "./message-loading";
import { Button, ButtonProps } from "../../ui/button";

// 1) ChatBubble
// Remove "max-w-[60%]" from the base class.
const chatBubbleVariant = cva("flex gap-2 items-end relative group w-full", {
  variants: {
    variant: {
      // you can keep 'received' / 'sent' if desired
      received: "self-start",
      sent: "self-end flex-row-reverse",
    },
    layout: {
      default: "",
      ai: "max-w-full w-full items-center",
    },
  },
  defaultVariants: {
    variant: "received",
    layout: "default",
  },
});

type ChatBubbleChildProps = {
  variant?: 'received' | 'sent';
  layout?: 'default' | 'ai';
  [key: string]: any; // Allow for additional props
};



interface ChatBubbleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleVariant> {}

    export const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
      ({ className, variant, layout, children, ...props }, ref) => (
        <div
          ref={ref}
          className={cn(chatBubbleVariant({ variant, layout, className }))}
          {...props}
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              // Cast the child's props to include our ChatBubbleChildProps
              return React.cloneElement(child, {
                variant,
                layout,
                ...(child.props as ChatBubbleChildProps),
              });
            }
            return child;
          })}
        </div>
      )
    );
                
    ChatBubble.displayName = "ChatBubble";

// 2) ChatBubbleAvatar
export const ChatBubbleAvatar: React.FC<{
  src?: string;
  fallback?: string;
  className?: string;
}> = ({ src, fallback, className }) => (
  <Avatar className={className}>
    <AvatarImage src={src} alt="Avatar" />
    <AvatarFallback>{fallback}</AvatarFallback>
  </Avatar>
);

// 3) ChatBubbleMessage
const chatBubbleMessageVariants = cva("p-4 w-full", {
  // Notice "w-full" is here so it expands
  // to the full width of the parent
  variants: {
    variant: {
      received: "bg-secondary text-secondary-foreground rounded-r-lg rounded-tl-lg",
      sent: "bg-primary text-primary-foreground rounded-l-lg rounded-tr-lg",
    },
    layout: {
      default: "",
      ai: "border-t w-full rounded-none bg-transparent",
    },
  },
  defaultVariants: {
    variant: "received",
    layout: "default",
  },
});

interface ChatBubbleMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleMessageVariants> {
  isLoading?: boolean;
}

export const ChatBubbleMessage = React.forwardRef<
  HTMLDivElement,
  ChatBubbleMessageProps
>(({ className, variant, layout, isLoading, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      chatBubbleMessageVariants({ variant, layout, className }),
      "break-words max-w-full whitespace-pre-wrap"
    )}
    {...props}
  >
    {isLoading ? (
      <div className="flex items-center space-x-2">
        <MessageLoading />
      </div>
    ) : (
      children
    )}
  </div>
));
ChatBubbleMessage.displayName = "ChatBubbleMessage";

// 4) ChatBubbleAction
type ChatBubbleActionProps = ButtonProps & {
  icon: React.ReactNode;
};

export const ChatBubbleAction: React.FC<ChatBubbleActionProps> = ({
  icon,
  onClick,
  className,
  variant = "ghost",
  size = "icon",
  ...props
}) => (
  <Button variant={variant} size={size} className={className} onClick={onClick} {...props}>
    {icon}
  </Button>
);

// 5) ChatBubbleActionWrapper
interface ChatBubbleActionWrapperProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "sent" | "received";
  className?: string;
}

export const ChatBubbleActionWrapper = React.forwardRef<
  HTMLDivElement,
  ChatBubbleActionWrapperProps
>(({ variant, className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
      variant === "sent"
        ? "-left-1 -translate-x-full"
        : "-right-1 translate-x-full",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
ChatBubbleActionWrapper.displayName = "ChatBubbleActionWrapper";