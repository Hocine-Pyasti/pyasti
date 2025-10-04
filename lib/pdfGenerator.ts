import { IOrder } from "@/lib/db/models/order.model";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const generateBillPDF = async (order: IOrder) => {
  const escapeLatex = (str: string) => {
    if (!str) return "";
    // Remove or replace unsupported Unicode characters (e.g., emojis)
    const cleanedStr = str.replace(/[\u{1F000}-\u{1FFFF}]/gu, "");
    // Escape LaTeX special characters
    return cleanedStr.replace(/([&%$#_{}~^\\])/g, "\\$1");
  };

  // Build item rows for the table
  const itemRows = order.items
    .map((item) => {
      const totalItemPrice = (item.price * item.quantity).toFixed(2);
      return `${escapeLatex(item.name)} (${escapeLatex(item.brand)}, ${escapeLatex(item.partNumber)}) & ${item.quantity} & ${item.price.toFixed(2)} DZD & ${totalItemPrice} DZD \\\\`;
    })
    .join("\n");

  const latexContent = `
\\documentclass[a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\usepackage{graphicx}
\\usepackage{array}
\\usepackage{booktabs}
\\usepackage{xcolor}
\\usepackage{url}
\\geometry{margin=1in}

\\begin{document}

% Header with logo
\\begin{center}
  \\includegraphics[width=0.3\\textwidth]{logo.png} \\\\
  \\vspace{0.5cm}
  \\textbf{\\Large Pyasti - Facture de Commande} \\\\
  \\vspace{0.5cm}
\\end{center}

% Order Details
\\section*{Détails de la Commande}
\\begin{tabular}{ll}
  \\textbf{Numéro de commande} & ${escapeLatex(order._id.toString())} \\\\
  \\textbf{Date de commande} & ${format(order.createdAt, "d MMM yyyy", { locale: fr })} \\\\
  \\textbf{Livraison prévue dans} & ${order.shippingMethod.daysToDeliver} jours \\\\
  \\textbf{Méthode de paiement} & ${escapeLatex(order.paymentMethod)} \\\\
  \\textbf{Statut du paiement} & ${order.isPaid ? "Payé" : "Non payé"} \\\\
  \\textbf{Statut de livraison} & ${order.isDelivered ? "Livré" : "Non livré"} \\\\
\\end{tabular}

% Client Address
\\section*{Adresse de Livraison}
\\begin{tabular}{ll}
  \\textbf{Nom} & ${escapeLatex(order.shippingAddress.fullName)} \\\\
  \\textbf{Téléphone} & ${escapeLatex(order.shippingAddress.phone)} \\\\
  \\textbf{Adresse} & ${escapeLatex(order.shippingAddress.street)}, ${escapeLatex(order.shippingAddress.city)}, ${escapeLatex(order.shippingAddress.province)}, ${escapeLatex(order.shippingAddress.postalCode)}, ${escapeLatex(order.shippingAddress.country)} \\\\
\\end{tabular}

% Items
\\section*{Articles Commandés}
\\begin{tabular}{>{\\raggedright\\arraybackslash}p{6cm}>{\\centering\\arraybackslash}p{2cm}>{\\centering\\arraybackslash}p{3cm}>{\\centering\\arraybackslash}p{3cm}}
  \\toprule
  \\textbf{Article} & \\textbf{Quantité} & \\textbf{Prix unitaire} & \\textbf{Total} \\\\
  \\midrule
  ${itemRows}
  \\bottomrule
\\end{tabular}

% Pricing Summary
\\section*{Résumé des Coûts}
\\begin{tabular}{lr}
  \\textbf{Prix des articles} & ${order.itemsPrice.toFixed(2)} DZD \\\\
  \\textbf{Frais de livraison} & ${order.shippingMethod.shippingPrice.toFixed(2)} DZD \\\\
  \\textbf{Taxe} & ${order.taxPrice.toFixed(2)} DZD \\\\
  \\textbf{Total} & ${order.totalPrice.toFixed(2)} DZD \\\\
\\end{tabular}

% Footer
\\vspace{1cm}
\\begin{center}
  \\color{gray}
  Merci d'utiliser les services Pyasti, \\url{https://pyasti.com}
\\end{center}

\\end{document}
`;

  // Send to backend for compilation
  const response = await fetch("/api/generate-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      latexContent,
      fileName: `pyasti-order-${order._id}.pdf`,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate PDF");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pyasti-order-${order._id}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
