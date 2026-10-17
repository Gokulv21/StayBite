interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
        <div className="w-full min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight text-foreground block">
            {title}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed block">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-wrap shrink-0 w-full sm:w-auto mt-1 sm:mt-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
