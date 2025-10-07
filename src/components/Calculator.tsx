import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Webhook URL - this is a public endpoint so it's safe to store in code
const SIMULATION_WEBHOOK_URL = "https://workflows.autobotics.com.br/webhook-test/53139f23-2c4b-4ec3-bb6e-5d0ce6b10f25";

export const Calculator = () => {
  const [amount, setAmount] = useState("");
  const [days, setDays] = useState<"30" | "60" | "90" | "">("");
  const [operator, setOperator] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmittedDetails, setHasSubmittedDetails] = useState(false);

  const calculateAdvance = () => {
    if (amount && days && operator) {
      const value = parseFloat(amount.replace(/[^\d,]/g, "").replace(",", "."));
      // Simulação simples: 5% de taxa
      const advanceValue = value * 0.95;
      setResult(advanceValue);
      setShowModal(true);
    } else {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitDetails = async () => {
    if (!nome.trim() || !telefone.trim()) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha nome e telefone.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const value = parseFloat(amount.replace(/[^\d,]/g, "").replace(",", "."));
      
      const payload = {
        valor_original: value,
        valor_antecipado: result,
        prazo_dias: days,
        operadora: operator,
        nome: nome,
        telefone: telefone,
        data_simulacao: new Date().toISOString(),
      };

      const response = await fetch(SIMULATION_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setHasSubmittedDetails(true);
        setShowModal(false);
        toast({
          title: "Simulação enviada!",
          description: "Em breve entraremos em contato.",
        });
      } else {
        throw new Error("Erro ao enviar simulação");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a simulação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const formatted = (parseFloat(numbers) / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `R$ ${formatted}`;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setAmount(formatted);
  };

  return (
    <section id="simular" className="py-16 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">
            Simule sua antecipação
          </h2>
          <p className="text-lg text-muted-foreground">
            Veja o quanto você pode receber adiantado de forma rápida.
          </p>
        </div>
        
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 lg:grid-cols-2 items-start">
            <div className="space-y-6 rounded-xl bg-card p-8 shadow-sm border border-border">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor a receber</Label>
                <Input
                  id="amount"
                  type="text"
                  placeholder="R$ 0,00"
                  value={amount}
                  onChange={handleAmountChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Prazo de recebimento</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(["30", "60", "90"] as const).map((dayOption) => (
                    <button
                      key={dayOption}
                      type="button"
                      onClick={() => setDays(dayOption)}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        days === dayOption
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:border-primary/50"
                      }`}
                    >
                      {dayOption} dias
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="operator">Operadora do plano</Label>
                <Select value={operator} onValueChange={setOperator}>
                  <SelectTrigger id="operator">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unimed">Unimed</SelectItem>
                    <SelectItem value="bradesco">Bradesco Saúde</SelectItem>
                    <SelectItem value="sulamerica">SulAmérica</SelectItem>
                    <SelectItem value="amil">Amil</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
                onClick={calculateAdvance}
              >
                Calcular valor antecipado
              </Button>
            </div>
            
            <div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-8 text-white shadow-lg relative overflow-hidden">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Valor antecipado</h3>
                <div className={`text-5xl font-bold transition-all ${!hasSubmittedDetails && result !== null ? 'blur-lg select-none' : ''}`}>
                  {result !== null
                    ? result.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    : "R$ 0,00"}
                </div>
                <p className="text-sm text-white/80">
                  {hasSubmittedDetails 
                    ? "Valor simulado. A proposta final será enviada após análise."
                    : "Preencha os dados para visualizar o valor"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete seus dados</DialogTitle>
              <DialogDescription>
                Informe seus dados para visualizar o valor da simulação
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSubmitDetails}
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Visualizar Simulação"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};
