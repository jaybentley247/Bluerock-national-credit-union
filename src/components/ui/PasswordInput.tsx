"use client";

import React, { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Use lighter icon colors that read well on dark backgrounds. */
  dark?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, style, dark = false, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <input
          {...props}
          ref={ref}
          type={visible ? "text" : "password"}
          className={className}
          style={{ paddingRight: "2.25rem", ...style }}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className={
            dark
              ? "absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
              : "absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          }
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
