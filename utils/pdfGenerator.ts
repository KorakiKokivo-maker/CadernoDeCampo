

import { RelatorioData, OperacaoCampo } from '../types';
import { formatCurrency, formatDate } from './calculations';

declare const jspdf: any;

export const generatePdf = (data: RelatorioData) => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();

    // Cabeçalho
    doc.setFontSize(20);
    doc.text('Caderno de Campo - Alchimist', 14, 22);
    doc.setFontSize(12);
    doc.text(`Relatório da Safra: ${data.nome}`, 14, 32);
    
    // Seção 1: Identificação
    doc.setFontSize(16);
    doc.text('1. Identificação', 14, 45);
    doc.autoTable({
        startY: 50,
        head: [['Propriedade', 'Cultura', 'Variedade', 'Área (ha)']],
        body: [[data.propriedade.nome, data.cultura, data.variedade, data.area_ha]],
        theme: 'striped',
    });

    // Seção 2: Resumo de Indicadores
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(16);
    doc.text('2. Resumo de Indicadores', 14, finalY + 15);
    doc.autoTable({
        startY: finalY + 20,
        head: [['Receita Total', 'Custo Total', 'Lucro Bruto', 'ROI (%)', 'Rendimento/ha']],
        body: [[
            formatCurrency(data.resultados.totalReceita),
            formatCurrency(data.resultados.totalCustos),
            formatCurrency(data.resultados.lucroBruto),
            `${data.resultados.roi.toFixed(2)}%`,
            formatCurrency(data.resultados.rentabilidadePorHa),
        ]],
        theme: 'striped',
    });
    
    // Seção 3: Detalhamento de Operações
    const finalY2 = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(16);
    doc.text('3. Operações de Campo', 14, finalY2 + 15);
    doc.autoTable({
        startY: finalY2 + 20,
        head: [['Data', 'Tipo', 'Produto', 'Custo']],
        body: data.operacoes.map((op: OperacaoCampo) => [
            formatDate(op.data),
            op.tipo,
            // FIX: Corrected property access to 'nome_produto' which now exists on the OperacaoCampo type.
            op.nome_produto || '-',
            formatCurrency(op.custo),
        ]),
        theme: 'grid',
    });

    // Seção 4: Detalhamento de Custos Variáveis
    const finalY3 = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(16);
    doc.text('4. Outros Custos Variáveis', 14, finalY3 + 15);
    doc.autoTable({
        startY: finalY3 + 20,
        head: [['Data', 'Descrição', 'Tipo', 'Valor']],
        body: data.custosVariaveis.map(c => [
            formatDate(c.data),
            c.descricao,
            c.tipo,
            formatCurrency(c.valor),
        ]),
        theme: 'grid',
    });
    
    // Rodapé
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Página ${i} de ${pageCount}`, 190, 285);
        doc.text('Responsável Técnico / Assinatura: _________________________', 14, 285);
    }
    
    doc.save(`Relatorio_${data.nome.replace(/\s/g, '_')}.pdf`);
};