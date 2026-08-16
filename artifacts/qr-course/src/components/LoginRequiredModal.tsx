import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { subscribeLoginRequired, isLoginRequiredOpen } from "@/lib/loginRequired";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

/**
 * Non-dismissible-until-actioned gate shown when an anonymous visitor has
 * sampled enough of the course. The only way forward is a free Google sign-in,
 * so the dialog intentionally has no close button and blocks every dismissal.
 */
export function LoginRequiredModal() {
  const [open, setOpen] = useState(isLoginRequiredOpen());

  useEffect(() => subscribeLoginRequired(setOpen), []);

  return (
    <DialogPrimitive.Root open={open}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:rounded-lg"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          data-testid="modal-login-required"
        >
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <DialogPrimitive.Title className="font-serif text-xl font-semibold leading-none tracking-tight text-primary">
              You've sampled the course
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-base text-muted-foreground">
              Sign in with Google (free) to keep going.
            </DialogPrimitive.Description>
          </div>
          <div className="mt-2">
            <a
              href={`${basePath}/api/auth/google`}
              className="inline-flex w-full items-center justify-center gap-2 px-6 py-3 rounded-md text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              data-testid="button-login-required-google"
            >
              Sign in with Google
            </a>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
