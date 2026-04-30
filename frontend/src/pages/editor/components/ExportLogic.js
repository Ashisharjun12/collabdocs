import { PDFExporter, pdfDefaultSchemaMappings } from "@blocknote/xl-pdf-exporter";
import { DOCXExporter, docxDefaultSchemaMappings } from "@blocknote/xl-docx-exporter";
import { pdf } from "@react-pdf/renderer";
import { toast } from 'sonner';

/**
 * Universal Export Utility for Flow Editor
 */

const getFilename = (title, ext) => {
  const name = title || "Untitled Document";
  return `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`;
};

const triggerDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportToMarkdown = (editor, title) => {
  try {
    const markdown = editor.blocksToMarkdownLossy(editor.document);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    triggerDownload(blob, getFilename(title, 'md'));
    toast.success("Markdown exported!");
  } catch (err) {
    console.error("MD Export failed:", err);
    toast.error("Failed to export Markdown");
  }
};

export const exportToText = (editor, title) => {
  try {
    const markdown = editor.blocksToMarkdownLossy(editor.document);
    // Strip markdown formatting for plain text
    const plainText = markdown.replace(/(\*\*|__|\[|\]\(.*?\)|#|>|`)/g, '');
    const blob = new Blob([plainText], { type: 'text/plain' });
    triggerDownload(blob, getFilename(title, 'txt'));
    toast.success("Text exported!");
  } catch (err) {
    toast.error("Failed to export text");
  }
};

export const exportToPDF = async (editor, title) => {
  const toastId = toast.loading("Preparing PDF...");
  try {
    const exporter = new PDFExporter(editor.schema, pdfDefaultSchemaMappings);
    const pdfDocument = await exporter.toReactPDFDocument(editor.document);
    const blob = await pdf(pdfDocument).toBlob();
    triggerDownload(blob, getFilename(title, 'pdf'));
    toast.success("PDF exported!", { id: toastId });
  } catch (err) {
    console.error("PDF Export failed:", err);
    toast.error("Failed to export PDF", { id: toastId });
  }
};

export const exportToDOCX = async (editor, title) => {
  const toastId = toast.loading("Preparing Word document...");
  try {
    const exporter = new DOCXExporter(editor.schema, docxDefaultSchemaMappings);
    const blob = await exporter.toBlob(editor.document);
    triggerDownload(blob, getFilename(title, 'docx'));
    toast.success("Word document exported!", { id: toastId });
  } catch (err) {
    console.error("DOCX Export failed:", err);
    toast.error("Failed to export Word document", { id: toastId });
  }
};
