"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  Users, 
  BadgeCheck,
  IdCard,
  History,
  CheckCircle2,
  XCircle,
  Eye,
  Check,
  X,
  Calendar,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/lib/api/config";
import { handleApiError } from "@/lib/api/error-handler";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiCreate } from "@/hooks/useApiCreate";
import { 
    PaginatedValidacionSchema,
    ValidacionListaItem,
    PaginatedValidacion
} from "@/schemas/identidad";
import { z } from "zod";
import { Pagination } from "@/components/generic/Pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function ValidacionIdentidadPage() {
  const [estado, setEstado] = useState("PENDIENTE");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Modal State
  const [selectedItem, setSelectedItem] = useState<ValidacionListaItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // 1. Fetch de validaciones paginadas
  const { data: paginatedData, isLoading, refetch } = useApiQuery({
    queryKey: ["validaciones-identidad", estado, page, pageSize],
    url: "/api/control/identidad/lista-validaciones",
    schema: PaginatedValidacionSchema,
    params: { 
        estado,
        page,
        page_size: pageSize
    }
  });

  // 2. Acciones
  const approveMutation = useApiCreate({
    url: selectedItem ? `/api/control/identidad/${selectedItem.id}/aprobar` : "",
  });

  const rejectMutation = useApiCreate({
    url: selectedItem ? `/api/control/identidad/${selectedItem.id}/rechazar` : "",
  });

  const handleApprove = async (item: ValidacionListaItem) => {
    try {
      await api.post(`/api/control/identidad/${item.id}/aprobar`);
      toast.success("Validación aprobada correctamente");
      refetch();
      setSelectedItem(null);
    } catch (error) {
      const message = handleApiError(error);
      toast.error(message);
    }
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    if (!rejectionReason) {
      toast.error("Debe ingresar un motivo de rechazo");
      return;
    }

    try {
      await api.post(`/api/control/identidad/${selectedItem.id}/rechazar`, { motivo: rejectionReason });
      toast.success("Validación rechazada");
      refetch();
      setSelectedItem(null);
      setIsRejecting(false);
      setRejectionReason("");
    } catch (error) {
      const message = handleApiError(error);
      toast.error(message);
    }
  };


  return (
    <div className="container mx-auto py-8 max-w-5xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#2C3E50]">Validación de Identidad</h1>
          <p className="text-muted-foreground">
            Gestión de solicitudes de verificación de DNI y privilegios.
          </p>
        </div>
      </div>

      <Tabs value={estado} onValueChange={(val) => { setEstado(val); setPage(1); }} className="w-full">
        <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-slate-100/80 border">
                <TabsTrigger value="PENDIENTE" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Pendientes
                    <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                        {estado === "PENDIENTE" ? paginatedData?.count || 0 : "..."}
                    </Badge>
                </TabsTrigger>
                <TabsTrigger value="APROBADA" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Aprobadas</TabsTrigger>
                <TabsTrigger value="RECHAZADA" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Rechazadas</TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value={estado} className="mt-0 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl" />
                ))}
            </div>
          ) : paginatedData?.items.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed rounded-xl bg-slate-50">
              <ShieldCheck className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium text-lg">No hay solicitudes en este estado</p>
              <p className="text-slate-400 text-sm">Todo el trabajo está al día.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {paginatedData?.items.map((item) => (
                <ValidacionHorizontalCard 
                    key={item.id} 
                    item={item} 
                    onApprove={() => handleApprove(item)}
                    onReview={() => { setSelectedItem(item); setRejectionReason(""); setIsRejecting(false); }}
                />
              ))}
            </div>
          )}

          <Pagination 
            currentPage={page}
            totalPages={Math.ceil((paginatedData?.count || 0) / pageSize)}
            onPageChange={setPage}
            totalItems={paginatedData?.count}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
        </TabsContent>
      </Tabs>

      {/* Modal de Revisión */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <History className="w-6 h-6 text-primary" />
                    Revisión de Identidad: {selectedItem?.persona.nombre_completo}
                </DialogTitle>
                <DialogDescription>
                    Verifique las fotos del DNI y los vínculos familiares antes de aprobar.
                </DialogDescription>
            </DialogHeader>

            <div className="grid md:grid-cols-2 gap-6 py-4">
                {/* Fotos */}
                <div className="space-y-4">
                    <h3 className="font-bold flex items-center gap-2 text-slate-800">
                        <BadgeCheck className="w-5 h-5 text-blue-500" />
                        Documentación (DNI)
                    </h3>
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase">Foto Frontal</p>
                            <div className="aspect-[1.6/1] bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-200 group relative">
                                {selectedItem?.dni_foto_frontal ? (
                                    <img 
                                        src={selectedItem.dni_foto_frontal} 
                                        alt="Frontal" 
                                        className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform" 
                                        onClick={() => window.open(selectedItem.dni_foto_frontal!, '_blank')}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <XCircle className="w-8 h-8 mb-2" />
                                        <p className="text-sm">Sin Foto Frontal</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase">Foto Reverso</p>
                            <div className="aspect-[1.6/1] bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-200 group relative">
                                {selectedItem?.dni_foto_reverso ? (
                                    <img 
                                        src={selectedItem.dni_foto_reverso} 
                                        alt="Reverso" 
                                        className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform"
                                        onClick={() => window.open(selectedItem.dni_foto_reverso!, '_blank')}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <XCircle className="w-8 h-8 mb-2" />
                                        <p className="text-sm">Sin Foto Reverso</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vínculos e Información */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold flex items-center gap-2 text-slate-800">
                                <Users className="w-5 h-5 text-emerald-500" />
                                Perfil en el Sistema
                            </h3>
                            <div className="flex gap-2">
                                {selectedItem?.es_contacto && (
                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">Contacto</Badge>
                                )}
                                {selectedItem?.es_familiar && (
                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">Familiar</Badge>
                                )}
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-500 uppercase">Vínculos Familiares</h4>
                            {selectedItem?.vinculos && selectedItem.vinculos.length > 0 ? (
                                selectedItem.vinculos.map(v => (
                                    <Card key={v.id} className="border-emerald-100 bg-emerald-50/30">
                                        <CardContent className="p-3 flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-bold text-emerald-800">{v.nombre_parentesco}</p>
                                                <p className="text-xs text-slate-600">Titular: {v.titular_nombre}</p>
                                                <p className="text-[10px] text-slate-400">DNI Titular: {v.titular_dni}</p>
                                            </div>
                                            <Badge variant="outline" className="bg-white text-[10px]">
                                                {v.nombre_estado}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="p-4 border border-dashed rounded-lg text-center bg-slate-50">
                                    <p className="text-sm text-slate-400 italic">No se encontraron vínculos directos.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                         <h3 className="font-bold flex items-center gap-2 text-slate-800">
                            <Calendar className="w-5 h-5 text-orange-500" />
                            Privilegios Actuales (Heredados/Propios)
                        </h3>
                        <div className="flex flex-wrap gap-2">
                             {selectedItem?.privilegios.map((p, i) => (
                                 <Badge key={i} variant="secondary" className="px-3 py-1 bg-white border">
                                     {p.nombre_origen}
                                 </Badge>
                             ))}
                             {selectedItem?.privilegios.length === 0 && <span className="text-sm text-slate-400">Ninguno</span>}
                        </div>
                    </div>

                    {isRejecting && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                            <label className="text-sm font-bold text-red-700 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Motivo del Rechazo
                            </label>
                            <Textarea 
                                placeholder="Indique la razón (ej: Fotos borrosas, DNI vencido...)"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="border-red-200 focus:ring-red-500"
                            />
                        </div>
                    )}
                </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
                {!isRejecting ? (
                    <>
                        <Button variant="outline" onClick={() => setSelectedItem(null)}>
                            Cerrar
                        </Button>
                        <div className="flex gap-2 ml-auto">
                            {selectedItem?.es_familiar && (
                                <>
                                    <Button variant="destructive" onClick={() => setIsRejecting(true)} className="flex gap-2">
                                        <X className="w-4 h-4" />
                                        Rechazar
                                    </Button>
                                    <Button 
                                        onClick={() => handleApprove(selectedItem!)} 
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        Aprobar Verificación
                                    </Button>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <Button variant="ghost" onClick={() => setIsRejecting(false)}>
                            Cancelar Rechazo
                        </Button>
                        <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason}>
                            Confirmar Rechazo
                        </Button>
                    </>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ValidacionHorizontalCard({ 
    item, 
    onApprove, 
    onReview 
}: { 
    item: ValidacionListaItem, 
    onApprove: () => void, 
    onReview: () => void 
}) {
    const isPending = item.estado === "PENDIENTE";
    
    return (
        <Card className="overflow-hidden group hover:shadow-md transition-all border-l-4 border-l-slate-200 hover:border-l-primary">
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center">
                    {/* Info Persona */}
                    <div className="p-6 flex-1 flex items-center gap-4 border-b md:border-b-0 md:border-r bg-white w-full">
                        <div className="bg-slate-100 p-4 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                            <IdCard className="w-8 h-8" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-xl font-bold truncate text-slate-800">{item.persona.nombre_completo}</h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground font-medium">
                                <span className="font-mono">DNI: <span className="text-slate-700">{item.persona.dni}</span></span>
                                <span className="text-slate-300">|</span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(item.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Info Status y Vinculos */}
                    <div className="p-6 md:w-80 bg-slate-50/50 flex flex-col justify-center gap-2 border-b md:border-b-0 md:border-r w-full">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Perfil</span>
                            <div className="flex gap-1">
                                {item.es_contacto && <Badge className="bg-blue-50 text-blue-600 text-[9px] border-blue-100">Contacto</Badge>}
                                {item.es_familiar && <Badge className="bg-emerald-50 text-emerald-600 text-[9px] border-emerald-100">Familiar</Badge>}
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Estado</span>
                            <Badge className={`${
                                item.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                                item.estado === 'APROBADA' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' :
                                'bg-red-100 text-red-700 hover:bg-red-100'
                            } text-[10px] font-bold border-0`}>
                                {item.nombre_estado}
                            </Badge>
                        </div>
                        {item.motivo_rechazo && (
                            <div className="mt-1 p-2 bg-red-50 rounded border border-red-100 text-[10px] text-red-700 italic">
                                "{item.motivo_rechazo}"
                            </div>
                        )}
                    </div>

                    {/* Acciones */}
                    <div className="p-6 bg-white shrink-0 flex gap-3 w-full md:w-auto justify-end">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={onReview}
                            className="flex gap-2 border-slate-200 hover:bg-slate-50"
                        >
                            <Eye className="w-4 h-4" />
                            <span className="md:hidden lg:inline">Revisar fotos</span>
                        </Button>

                        {isPending && item.es_familiar && (
                            <Button 
                                size="sm" 
                                onClick={onApprove}
                                className="bg-primary hover:bg-primary/90 text-white flex gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="md:hidden lg:inline">Aprobar</span>
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
