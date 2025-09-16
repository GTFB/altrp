import InlineCodeExample from "./inline-code-example";

export default function InlineCodeExampleDemo() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Inline Code Examples</h3>
        <p className="text-muted-foreground mb-4">
          Perfect for displaying small code snippets inline with your content.
        </p>
        
        <div className="space-y-4">
          <div>
            <p className="mb-2">Install the package:</p>
            <InlineCodeExample>
{`npm install @radix-ui/react-dialog`}
            </InlineCodeExample>
          </div>

          <div>
            <p className="mb-2">Import the component:</p>
            <InlineCodeExample>
{`import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";`}
            </InlineCodeExample>
          </div>

          <div>
            <p className="mb-2">Use in your JSX:</p>
            <InlineCodeExample>
{`<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>Content here</DialogContent>
</Dialog>`}
            </InlineCodeExample>
          </div>
        </div>
      </div>
    </div>
  );
}
