import {
  cloneElement,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils/cn";

import { resolveFieldErrors, type FieldErrorProps } from "./form-control";

interface ControlA11yProps {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "false" | "true";
}

export interface FormFieldProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "id">, FieldErrorProps {
  id: string;
  name?: string;
  label: ReactNode;
  description?: ReactNode;
  required?: boolean;
  children: ReactNode;
}

function withFieldA11y(
  children: ReactNode,
  id: string,
  describedBy: string | undefined,
  hasErrors: boolean,
) {
  if (!isValidElement<ControlA11yProps>(children)) return children;

  const existingDescribedBy = children.props["aria-describedby"];
  const nextDescribedBy = [existingDescribedBy, describedBy].filter(Boolean).join(" ") || undefined;

  return cloneElement(children as ReactElement<ControlA11yProps>, {
    id: children.props.id ?? id,
    "aria-describedby": nextDescribedBy,
    "aria-invalid": hasErrors ? true : children.props["aria-invalid"],
  });
}

export function FormField({
  id,
  name,
  label,
  description,
  required = false,
  errors,
  fieldErrors,
  children,
  className,
  ...props
}: FormFieldProps) {
  const resolvedErrors = resolveFieldErrors(errors, fieldErrors, name);
  const hasErrors = resolvedErrors.length > 0;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = hasErrors ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  const control = withFieldA11y(children, id, describedBy, hasErrors);

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <label htmlFor={id} className="type-meta text-foreground-muted">
        {label}
        {required ? (
          <>
            <span aria-hidden="true"> *</span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
      </label>

      {description ? (
        <p id={descriptionId} className="type-spec text-foreground-muted">
          {description}
        </p>
      ) : null}

      {control}

      {hasErrors ? (
        <div id={errorId} role="alert" aria-live="polite" className="type-spec text-critical">
          {resolvedErrors.length === 1 ? (
            resolvedErrors[0]
          ) : (
            <ul className="flex list-disc flex-col gap-1 pl-5">
              {resolvedErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
