import ComponentLayout from "./component-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ComponentLayoutDemo() {
  return (
    <div className="space-y-8">
      <ComponentLayout
        title="Component Layout Demo"
        description="This is a demonstration of the ComponentLayout wrapper component"
        showCodeExample={true}
        codeExample={`<ComponentLayout
  title="Your Title"
  description="Your description"
  showCodeExample={true}
  codeExample="Your code here"
>
  <YourContent />
</ComponentLayout>`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Card 1</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This is the first card content.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Card 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This is the second card content.</p>
            </CardContent>
          </Card>
        </div>
        <div className="flex gap-2 justify-center">
          <Button>Primary Action</Button>
          <Button variant="outline">Secondary Action</Button>
        </div>
      </ComponentLayout>
    </div>
  );
}
