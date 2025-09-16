import CodeExample from "./code-example";
import InlineCodeExample from "./inline-code-example";

export default function CodeExampleDemo() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Full Code Example</h3>
        <CodeExample title="React Component Example">
{`import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}`}
        </CodeExample>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Inline Code Example</h3>
        <p className="text-muted-foreground mb-4">
          Use the <code className="bg-muted px-1 py-0.5 rounded text-sm">Button</code> component like this:
        </p>
        <InlineCodeExample>
{`<Button variant="outline" size="sm">
  Click me
</Button>`}
        </InlineCodeExample>
      </div>
    </div>
  );
}
