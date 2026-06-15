import { useState } from "react";
import { Layout } from "@/components/Layout";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Gift, Plus, Pencil, Trash2, Package, Zap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTiposBrinde, type TipoBrinde } from "@/hooks/useTiposBrinde";

interface FormState {
  nome: string;
  icone_url: string;
  estoque: number;
  ativo: boolean;
  entrega_automatica: boolean;
}

const emptyForm: FormState = {
  nome: "",
  icone_url: "",
  estoque: 0,
  ativo: true,
  entrega_automatica: false,
};

function BrindesAdminContent() {
  const queryClient = useQueryClient();
  const { data: tipos = [], isLoading } = useTiposBrinde();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TipoBrinde | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["tipos_brinde"] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.nome.trim()) throw new Error("Nome é obrigatório");
      const payload = {
        nome: form.nome.trim(),
        icone_url: form.icone_url.trim() || null,
        estoque: Number(form.estoque) || 0,
        ativo: form.ativo,
        entrega_automatica: form.entrega_automatica,
      };
      if (editing) {
        const { error } = await (supabase as any)
          .from("tipos_brinde")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("tipos_brinde")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Brinde atualizado" : "Brinde cadastrado");
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      invalidate();
    },
    onError: (e: any) => toast.error(e.message || "Erro ao salvar"),
  });

  const togglePropMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: "ativo" | "entrega_automatica"; value: boolean }) => {
      const { error } = await (supabase as any)
        .from("tipos_brinde")
        .update({ [field]: value })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
    onError: (e: any) => toast.error(e.message || "Erro ao atualizar"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("tipos_brinde").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Brinde excluído");
      invalidate();
    },
    onError: (e: any) => toast.error(e.message || "Erro ao excluir"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (tipo: TipoBrinde) => {
    setEditing(tipo);
    setForm({
      nome: tipo.nome,
      icone_url: tipo.icone_url || "",
      estoque: tipo.estoque,
      ativo: tipo.ativo,
      entrega_automatica: tipo.entrega_automatica,
    });
    setDialogOpen(true);
  };

  const totalTipos = tipos.length;
  const totalAtivos = tipos.filter((t) => t.ativo).length;
  const estoqueTotal = tipos.reduce((sum, t) => sum + (t.estoque || 0), 0);

  const renderIcone = (url: string | null) => {
    if (!url) return <Gift className="w-5 h-5 text-muted-foreground" />;
    if (url.startsWith("http")) {
      return <img src={url} alt="" className="w-8 h-8 object-contain rounded" />;
    }
    return <span className="text-2xl">{url}</span>;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Gestão de Brindes</h1>
              <p className="text-muted-foreground">Cadastre e gerencie os brindes disponíveis</p>
            </div>
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Brinde
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="w-4 h-4" /> Total de Tipos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTipos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4" /> Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{totalAtivos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Gift className="w-4 h-4" /> Estoque Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{estoqueTotal}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Brindes Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : tipos.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                Nenhum brinde cadastrado. Clique em "Novo Brinde" para começar.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Ícone</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Entrega Automática</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tipos.map((tipo) => (
                    <TableRow key={tipo.id}>
                      <TableCell>{renderIcone(tipo.icone_url)}</TableCell>
                      <TableCell className="font-medium">{tipo.nome}</TableCell>
                      <TableCell>
                        <Badge variant={tipo.estoque > 0 ? "secondary" : "destructive"}>
                          {tipo.estoque}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={tipo.entrega_automatica}
                          onCheckedChange={(v) =>
                            togglePropMutation.mutate({ id: tipo.id, field: "entrega_automatica", value: v })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={tipo.ativo}
                          onCheckedChange={(v) =>
                            togglePropMutation.mutate({ id: tipo.id, field: "ativo", value: v })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(tipo)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              if (confirm(`Excluir "${tipo.nome}"?`)) deleteMutation.mutate(tipo.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Brinde" : "Novo Brinde"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Ex: Cooler"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icone">Ícone (URL de imagem ou emoji)</Label>
              <Input
                id="icone"
                value={form.icone_url}
                onChange={(e) => setForm((f) => ({ ...f, icone_url: e.target.value }))}
                placeholder="🍷  ou  https://..."
              />
              {form.icone_url && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  Preview: {renderIcone(form.icone_url)}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="estoque">Estoque</Label>
              <Input
                id="estoque"
                type="number"
                min={0}
                value={form.estoque}
                onChange={(e) => setForm((f) => ({ ...f, estoque: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-medium text-sm">Entrega Automática</div>
                <div className="text-xs text-muted-foreground">
                  Entregue ao registrar a visita
                </div>
              </div>
              <Switch
                checked={form.entrega_automatica}
                onCheckedChange={(v) => setForm((f) => ({ ...f, entrega_automatica: v }))}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-medium text-sm">Ativo</div>
                <div className="text-xs text-muted-foreground">
                  Disponível para entrega
                </div>
              </div>
              <Switch
                checked={form.ativo}
                onCheckedChange={(v) => setForm((f) => ({ ...f, ativo: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default function BrindesAdmin() {
  return (
    <AdminProtectedRoute>
      <BrindesAdminContent />
    </AdminProtectedRoute>
  );
}