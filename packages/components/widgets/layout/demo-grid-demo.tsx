import DemoGrid from "./demo-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DemoGridDemo() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">1 Column Grid</h3>
        <DemoGrid columns={1}>
          <Card><CardHeader><CardTitle>Item 1</CardTitle></CardHeader><CardContent>Content 1</CardContent></Card>
          <Card><CardHeader><CardTitle>Item 2</CardTitle></CardHeader><CardContent>Content 2</CardContent></Card>
          <Card><CardHeader><CardTitle>Item 3</CardTitle></CardHeader><CardContent>Content 3</CardContent></Card>
        </DemoGrid>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">2 Column Grid</h3>
        <DemoGrid columns={2}>
          <Card><CardHeader><CardTitle>Item 1</CardTitle></CardHeader><CardContent>Content 1</CardContent></Card>
          <Card><CardHeader><CardTitle>Item 2</CardTitle></CardHeader><CardContent>Content 2</CardContent></Card>
          <Card><CardHeader><CardTitle>Item 3</CardTitle></CardHeader><CardContent>Content 3</CardContent></Card>
          <Card><CardHeader><CardTitle>Item 4</CardTitle></CardHeader><CardContent>Content 4</CardContent></Card>
        </DemoGrid>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">3 Column Grid</h3>
        <DemoGrid columns={3}>
          <Card><CardHeader><CardTitle>Item 1</CardTitle></CardHeader><CardContent>Content 1</CardContent></Card>
          <Card><CardHeader><CardTitle>Item 2</CardTitle></CardHeader><CardContent>Content 2</CardContent></Card>
          <Card><CardHeader><CardTitle>Item 3</CardTitle></CardHeader><CardContent>Content 3</CardContent></Card>
          <Card><CardHeader><CardTitle>Item 4</CardTitle></CardHeader><CardContent>Content 4</CardContent></Card>
          <Card><CardHeader><CardTitle>Item 5</CardTitle></CardHeader><CardContent>Content 5</CardContent></Card>
          <Card><CardHeader><CardTitle>Item 6</CardTitle></CardHeader><CardContent>Content 6</CardContent></Card>
        </DemoGrid>
      </div>
    </div>
  );
}
