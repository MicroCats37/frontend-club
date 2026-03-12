"use client";

import React from "react";
import {
    X,
    Printer,
    XCircle,
    Receipt as ReceiptIcon,
    CreditCard,
    Info,
    Calendar,
    Wallet
} from "lucide-react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    visita: any;
}

export const ReceiptModal = ({ isOpen, onClose, visita }: ReceiptModalProps) => {
    if (!visita) return null;

    const isBungalow = !!visita.reserva_asociada;

    // Consolidar órdenes de forma extremadamente simple y segura
    const ordenes: any[] = [];

    // 1. Alojamiento
    if (visita.reserva_asociada) {
        const res = visita.reserva_asociada;
        const oc = res.orden_cobro;
        ordenes.push({
            tipo: "ALOJAMIENTO",
            id: oc?.id || "N/A",
            monto_total: oc?.monto_total ?? res.precio_total ?? 0,
            saldo_pendiente: oc?.saldo_pendiente ?? (res.esta_pagada ? 0 : (res.precio_total ?? 0)),
            estado: oc?.estado ?? (res.esta_pagada ? 'PAGADA' : 'PENDIENTE'),
            pagos: oc?.pagos || []
        });
    }

    // 2. Ingresos
    if (visita.lista_ingresantes) {
        const lista = visita.lista_ingresantes;
        const oc = lista.orden_cobro;
        ordenes.push({
            tipo: "INGRESOS",
            id: oc?.id || "N/A",
            monto_total: oc?.monto_total ?? lista.monto_total ?? 0,
            saldo_pendiente: oc?.saldo_pendiente ?? (lista.esta_pagada ? 0 : (lista.monto_total ?? 0)),
            estado: oc?.estado ?? (lista.esta_pagada ? 'PAGADA' : 'PENDIENTE'),
            pagos: oc?.pagos || []
        });
    }

    const handlePrint = () => {
        window.print();
    };

    const parseNum = (val: any) => {
        if (typeof val === 'number') return val;
        const n = parseFloat(String(val || "0").replace(/[^0-9.-]+/g, ""));
        return isNaN(n) ? 0 : n;
    };

    const montoTotal = parseNum(visita.monto_total);
    const saldoTotal = parseNum(visita.saldo_total);
    const pagadoAcumulado = montoTotal - saldoTotal;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[32px] border-none shadow-2xl">
                <div className="bg-[#2C3A2C] p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-xl">
                            <ReceiptIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-black text-lg tracking-tight">Comprobante de Visita</h3>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                Registro: {visita.id?.split("-")[0]?.toUpperCase() || "VISITA"}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-white/60 hover:text-white hover:bg-white/10 rounded-full"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-8 space-y-8 bg-white max-h-[80vh] overflow-y-auto no-scrollbar print:max-h-none print:p-12">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="font-black text-xl text-[#2C3A2C] tracking-tight">CLUB DE ESPARCIMIENTO</p>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Sede Campestre</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha Emisión</p>
                            <p className="font-bold text-gray-900">{format(new Date(), "PP", { locale: es })}</p>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100" />

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Responsable</h4>
                            <p className="font-black text-gray-900 text-lg leading-tight uppercase">
                                {visita.titular?.nombre_completo || visita.titular?.nombres || "Socio Invitado"}
                            </p>
                            <p className="font-bold text-gray-500 flex items-center gap-2">
                                <Info className="h-3 w-3" /> DNI: {visita.titular?.dni || "---"}
                            </p>
                        </div>
                        <div className="space-y-2 text-right">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detalle de Visita</h4>
                            <Badge className={`${isBungalow ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"} border-none rounded-lg px-3 py-1 font-black text-[10px]`}>
                                {isBungalow ? "ESTADÍA EN BUNGALOW" : "FULL DAY / VISITA DÍA"}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-[#2C3A2C] uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Estado de Cobros
                        </h4>

                        <div className="space-y-3">
                            {ordenes.map((orden, idx) => (
                                <div key={idx} className="bg-gray-50 p-5 rounded-2xl border border-gray-100/50 flex flex-col gap-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className={`${orden.tipo === 'ALOJAMIENTO' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'} p-2 rounded-xl`}>
                                                {orden.tipo === 'ALOJAMIENTO' ? <Calendar className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <p className="font-black text-xs text-gray-900 uppercase tracking-tight">
                                                    {orden.tipo === 'ALOJAMIENTO' ? "Reserva de Bungalow" : "Servicios de Ingreso"}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-bold">Cobro Consolidado</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={`rounded-lg py-0.5 px-3 font-black text-[9px] uppercase tracking-wider ${orden.estado === 'PAGADA' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            orden.estado === 'VENCIDA' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                            {orden.estado === 'PAGADA' ? 'PAGADO' : orden.estado}
                                        </Badge>
                                    </div>

                                    <div className="flex justify-between items-end border-t border-gray-100 pt-3 mt-1">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase">Monto Total</p>
                                            <p className="font-black text-xl text-gray-900">S/ {parseNum(orden.monto_total).toFixed(2)}</p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase">Faltante</p>
                                            <p className={`font-black text-xl ${parseNum(orden.saldo_pendiente) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                S/ {parseNum(orden.saldo_pendiente).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    {orden.pagos && orden.pagos.length > 0 && (
                                        <div className="space-y-2 mt-2">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Transacciones Confirmadas</p>
                                            {orden.pagos.map((p: any, pIdx: number) => (
                                                <div key={pIdx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-gray-50 p-2 rounded-lg text-gray-400">
                                                            <CreditCard className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-xs uppercase tracking-tight">REF: {p.referencia || 'N/A'}</p>
                                                            <p className="text-[10px] text-gray-400 font-medium">
                                                                {format(new Date(p.created_at), "dd/MM/yyyy HH:mm")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-emerald-600 text-sm">S/ {parseNum(p.monto).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {orden.estado === 'VENCIDA' && (
                                        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3">
                                            <XCircle className="h-5 w-5 text-rose-500" />
                                            <div>
                                                <p className="text-xs font-black text-rose-700 uppercase tracking-tight">ATENCIÓN: ORDEN VENCIDA</p>
                                                <p className="text-[10px] text-rose-600 font-medium">El plazo de pago ha expirado. Comuníquese con administración.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t-2 border-dashed border-gray-100 pt-8 space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-gray-400 text-xs font-bold leading-relaxed max-w-xs">
                                Este documento es un comprobante interno de control. No tiene validez legal como factura fiscal ante SUNAT.
                            </p>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Pagado</p>
                                <p className="text-4xl font-black text-[#2C3A2C]">S/ {pagadoAcumulado.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 flex gap-4 border-t border-gray-100">
                    <Button
                        onClick={handlePrint}
                        className="flex-1 bg-[#2C3A2C] hover:bg-black text-white font-black h-12 rounded-2xl shadow-xl shadow-gray-200 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                    >
                        <Printer className="h-4 w-4" /> Imprimir / PDF
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-xs border-gray-200"
                    >
                        Cerrar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
