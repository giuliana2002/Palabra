import type { ReactNode } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface Props {
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, lead, actions }: Props) {
  useDocumentTitle(title);
  return (
    <header className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        {lead && <p className="lead">{lead}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
