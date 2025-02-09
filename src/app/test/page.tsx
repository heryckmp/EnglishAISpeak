import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function TestPage() {
  return (
    <div className="p-8 space-y-8">
      <section>
        <h1 className="text-2xl font-bold mb-4">Button Test</h1>
        <div className="space-y-4">
          <div className="space-x-4">
            <Button>Default Button</Button>
            <Button variant="destructive">Destructive Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="link">Link Button</Button>
          </div>

          <div className="space-x-4">
            <Button size="sm">Small Button</Button>
            <Button size="default">Default Size</Button>
            <Button size="lg">Large Button</Button>
            <Button size="icon">🔍</Button>
          </div>
        </div>
      </section>

      <section>
        <h1 className="text-2xl font-bold mb-4">Card Test</h1>
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card Description goes here.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is the main content of the card. You can put anything here.</p>
            </CardContent>
            <CardFooter>
              <Button>Action</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interactive Card</CardTitle>
              <CardDescription>A card with multiple actions</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card demonstrates multiple buttons and interactions.</p>
            </CardContent>
            <CardFooter className="space-x-2">
              <Button variant="outline">Cancel</Button>
              <Button>Submit</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section>
        <h1 className="text-2xl font-bold mb-4">Input Test</h1>
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Examples</CardTitle>
              <CardDescription>Different types of input fields</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Default Input</label>
                <Input placeholder="Type something..." />
              </div>
              
              <div>
                <label className="text-sm font-medium">Email Input</label>
                <Input type="email" placeholder="email@example.com" />
              </div>

              <div>
                <label className="text-sm font-medium">Password Input</label>
                <Input type="password" placeholder="Enter your password" />
              </div>

              <div>
                <label className="text-sm font-medium">Disabled Input</label>
                <Input disabled placeholder="This input is disabled" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search Form</CardTitle>
              <CardDescription>Example of input with button</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input placeholder="Search..." />
                <Button>Search</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
} 