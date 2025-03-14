import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Templates | LLM State Builder",
  description: "Browse and use pre-built agent templates",
}

export default function TemplatesPage() {
  return (
    <div className="container py-10">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="icon" asChild className="mr-4">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Agent Templates</h1>
          <p className="text-muted-foreground">Start with a pre-built template to accelerate your development</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TemplateCard
          title="Customer Support Agent"
          description="A multi-state agent that handles customer inquiries, troubleshooting, and escalation."
          states={["Greeting", "Issue Identification", "Troubleshooting", "Resolution", "Escalation"]}
        />

        <TemplateCard
          title="E-commerce Assistant"
          description="Helps customers find products, add to cart, and complete checkout."
          states={["QueryProducts", "AddSKUToCart", "AddressCollection", "CheckoutCart"]}
        />

        <TemplateCard
          title="Interview Bot"
          description="Conducts structured interviews with candidates, asking questions and recording responses."
          states={[
            "Introduction",
            "Background Questions",
            "Technical Assessment",
            "Behavioral Questions",
            "Candidate Questions",
          ]}
        />

        <TemplateCard
          title="Learning Assistant"
          description="Guides users through educational content with explanations and quizzes."
          states={["Topic Introduction", "Concept Explanation", "Example Problems", "Quiz", "Feedback"]}
        />

        <TemplateCard
          title="Appointment Scheduler"
          description="Helps users schedule appointments by collecting information and confirming details."
          states={["Service Selection", "Date Selection", "Time Selection", "Contact Information", "Confirmation"]}
        />

        <TemplateCard
          title="Survey Bot"
          description="Conducts surveys with branching logic based on user responses."
          states={["Introduction", "Demographics", "Main Questions", "Follow-up Questions", "Conclusion"]}
        />
      </div>
    </div>
  )
}

function TemplateCard({
  title,
  description,
  states,
}: {
  title: string
  description: string
  states: string[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h4 className="text-sm font-medium">States:</h4>
          <ul className="text-sm space-y-1">
            {states.map((state, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                {state}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Use Template</Button>
      </CardFooter>
    </Card>
  )
}

