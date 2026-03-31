import { useAppStore } from '@/store/useAppStore';
import { Construction } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderProps) {
  const { activeProject } = useAppStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light mb-4">
        <Construction className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-xl font-bold text-foreground mb-1">{title}</h1>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        {description}
      </p>
      <p className="text-xs text-muted-foreground mt-4">
        Active project: <span className="font-medium text-foreground">{activeProject?.name}</span>
      </p>
    </div>
  );
}
