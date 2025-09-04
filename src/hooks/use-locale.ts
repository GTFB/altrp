import { useParams } from 'next/navigation';

export function useLocale(): string {
  const params = useParams();
  return (params.locale as string) || 'en';
}
