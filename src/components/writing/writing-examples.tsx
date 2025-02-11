import { Card } from "@/components/ui/card";

interface WritingExample {
  title: string;
  original: string;
  improved: string;
  feedback: string;
}

const examples: WritingExample[] = [
  {
    title: "E-mail Formal",
    original: "Dear Sir, I am writing to inform about my interest in the job position. I have 5 years of experience and I think I am the best candidate.",
    improved: "Dear Sir/Madam,\n\nI am writing to express my interest in the advertised position. With five years of relevant experience, I believe I would be a strong candidate for this role.",
    feedback: "Melhorias:\n- Formalidade adequada\n- Expressões mais profissionais\n- Estrutura mais clara"
  },
  {
    title: "Descrição Pessoal",
    original: "I like to travel and know new places. In my free time I watch movies and hang out with my friends.",
    improved: "I am passionate about traveling and exploring new destinations. During my leisure time, I enjoy watching films and spending quality time with friends.",
    feedback: "Melhorias:\n- Vocabulário mais rico\n- Estruturas mais sofisticadas\n- Melhor fluidez"
  },
  {
    title: "Opinião",
    original: "I think social media is very bad for kids because they spend too much time on phone.",
    improved: "In my opinion, social media can have a negative impact on children as they tend to spend excessive amounts of time on their devices.",
    feedback: "Melhorias:\n- Argumentação mais elaborada\n- Linguagem mais acadêmica\n- Estrutura mais formal"
  }
];

export function WritingExamples() {
  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Exemplos de Escrita</h2>
      
      <div className="space-y-6">
        {examples.map((example, index) => (
          <div key={index} className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">{example.title}</h3>
            
            <div className="space-y-2">
              <div>
                <div className="text-sm font-medium text-gray-600">Original:</div>
                <p className="p-2 bg-gray-100 rounded text-gray-900">{example.original}</p>
              </div>
              
              <div>
                <div className="text-sm font-medium text-green-700">Versão Melhorada:</div>
                <p className="p-2 bg-green-50 rounded whitespace-pre-wrap text-gray-900">{example.improved}</p>
              </div>
              
              <div>
                <div className="text-sm font-medium text-blue-700">Feedback:</div>
                <p className="p-2 bg-blue-50 rounded whitespace-pre-wrap text-gray-900">{example.feedback}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 