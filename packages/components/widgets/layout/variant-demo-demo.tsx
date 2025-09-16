import VariantDemo from "./variant-demo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VariantDemoDemo() {
  return (
    <div className="space-y-8">
      <VariantDemo
        title="Button Variants"
        description="Different button styles and their use cases"
      >
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </VariantDemo>

      <VariantDemo
        title="Badge Variants"
        description="Different badge styles for various contexts"
      >
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </VariantDemo>

      <VariantDemo
        title="Card Variants"
        description="Different card layouts and styles"
      >
        <div className="flex gap-4">
          <Card className="w-48">
            <CardHeader>
              <CardTitle>Simple Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Basic card content</p>
            </CardContent>
          </Card>
          <Card className="w-48 border-dashed">
            <CardHeader>
              <CardTitle>Dashed Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Card with dashed border</p>
            </CardContent>
          </Card>
        </div>
      </VariantDemo>
    </div>
  );
}
