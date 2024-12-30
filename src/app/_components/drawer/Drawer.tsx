import { type ReactNode } from "react";

interface BaseProps {
  className?: string;
  children: ReactNode;
}

export interface DrawerProps extends BaseProps {
  title?: string;
  /**
   * Optional width class override. 
   * Default is "w-96"
   */
  widthClass?: string;
}

export interface DrawerSectionProps extends BaseProps {
  title?: string;
}

export interface DrawerListItem {
  label: string;
  value: string | number | null;
}

export interface DrawerListProps extends Omit<BaseProps, "children"> {
  items: DrawerListItem[];
}

export const Drawer: React.FC<DrawerProps> = ({ 
  title,
  children,
  className = "",
  widthClass = "w-96"
}) => {
  return (
    <div 
      className={`fixed inset-y-0 right-0 ${widthClass} overflow-y-auto border-l border-gray-200 bg-white ${className}`}
      aria-labelledby={title ? "drawer-title" : undefined}
      role="complementary"
    >
      <div className="h-full overflow-y-auto p-6">
        {title && (
          <div className="mb-6">
            <h2 
              id="drawer-title"
              className="text-lg font-semibold text-gray-900"
            >
              {title}
            </h2>
          </div>
        )}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export const DrawerSection: React.FC<DrawerSectionProps> = ({
  title,
  children,
  className = ""
}) => {
  return (
    <div 
      className={`${className}`}
      role="region"
      aria-labelledby={title ? "section-title" : undefined}
    >
      {title && (
        <h3 
          id="section-title"
          className="font-medium text-gray-900 mb-2"
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export const DrawerList: React.FC<DrawerListProps> = ({
  items,
  className = ""
}) => {
  return (
    <dl className={`divide-y divide-gray-200 border-t border-b border-gray-200 ${className}`}>
      {items.map((item, index) => (
        <div 
          key={`${item.label}-${index}`}
          className="flex justify-between py-3 text-sm"
        >
          <dt className="text-gray-500 font-medium">{item.label}</dt>
          <dd className="text-gray-900 font-medium">
            {item.value ?? "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
};