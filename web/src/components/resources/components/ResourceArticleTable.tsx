import type { ReactNode } from 'react';
import { resourceArticleStyles } from './resourceArticleStyles';

interface ResourceArticleTableProps {
  children: ReactNode;
}

export default function ResourceArticleTable({ children }: ResourceArticleTableProps) {
  return (
    <div className={resourceArticleStyles.tableWrap}>
      <table className={resourceArticleStyles.table}>{children}</table>
    </div>
  );
}