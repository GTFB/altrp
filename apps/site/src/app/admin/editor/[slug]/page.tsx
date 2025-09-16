import { TipTapEditor } from '@/components/features/cms/TipTapEditor';

export default function EditorPage({ params }: { params: { slug: string } }) {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Post: {params.slug}</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          <TipTapEditor
            content="<h1>Start writing...</h1>"
            onChange={(content) => console.log('Content changed:', content)}
          />
        </div>
      </div>
    </div>
  );
}
