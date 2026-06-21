import type { ReactNode } from "react";

interface Props {
  sidebar: ReactNode;
  header: ReactNode;
  banner?: ReactNode;
  rightRail?: ReactNode;
  children: ReactNode;
}

export default function WorkspaceLayout({ sidebar, header, banner, rightRail, children }: Props) {
  return (
    <div className="flex h-[calc(100vh-65px)] overflow-hidden">
      {sidebar}
      <div className="flex-1 flex flex-col min-w-0">
        {header}
        {banner}
        <div className="flex-1 flex overflow-hidden min-h-0">
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">{children}</main>
          {rightRail}
        </div>
      </div>
    </div>
  );
}
