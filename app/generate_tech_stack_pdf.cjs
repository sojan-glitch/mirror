const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
});

const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const margin = 14;
const contentWidth = pageWidth - (margin * 2);

function drawHeader(title, subtitle) {
  // Top Banner
  doc.setFillColor(9, 13, 22); // #090d16
  doc.rect(0, 0, pageWidth, 28, 'F');
  
  // Cyan accent line
  doc.setFillColor(6, 182, 212); // cyan-500
  doc.rect(0, 27, pageWidth, 1.2, 'F');

  // Title text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(title, margin, 13);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(subtitle, margin, 21);

  // Badge on right
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(pageWidth - margin - 45, 7, 45, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(34, 211, 238);
  doc.text('PROJECT MIRROR', pageWidth - margin - 42, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('CRIMEATHON 2026', pageWidth - margin - 42, 18);
}

function drawFooter(pageNo, totalPages) {
  doc.setDrawColor(30, 46, 74);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CONFIDENTIAL // CASE CR-26-047 DEFENSE BRIEF // HARBOR & FINCH FREIGHT PVT. LTD.', margin, pageHeight - 7);
  doc.text(`Page ${pageNo} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 7);
}

// ---------------- PAGE 1 ----------------
drawHeader(
  'PROJECT MIRROR - ARCHITECTURE & TECH STACK',
  'Defense-Oriented Forensic Audit & Vendor Cross-Examination Engine'
);

let y = 36;

// Executive Summary Box
doc.setFillColor(11, 16, 29);
doc.setDrawColor(30, 46, 74);
doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(56, 189, 248); // sky-400
doc.text('EXECUTIVE SYSTEM OVERVIEW', margin + 4, y + 6);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(203, 213, 225); // slate-300
const introText = "MIRROR (Multi-source Incident Reconstruction & Reconciliation of Representations) is an evidence-first, defense-oriented cybersecurity platform built to automatically adjudicate vendor breach explanations against 20 disparate corporate forensic data sources (E01-E20). Below is the comprehensive technical stack detailing Frontend, Backend/Data Ingestion, and AI/Forensic engines.";
const splitIntro = doc.splitTextToSize(introText, contentWidth - 8);
doc.text(splitIntro, margin + 4, y + 12);

y += 30;

// SECTION 1: FRONTEND
doc.setFillColor(15, 23, 42);
doc.roundedRect(margin, y, contentWidth, 7, 1.5, 1.5, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(34, 211, 238);
doc.text('1. FRONTEND ARCHITECTURE & USER INTERFACE', margin + 4, y + 5);

y += 11;

const frontendComponents = [
  {
    name: 'React 19 & TypeScript',
    desc: 'Cutting-edge reactive UI runtime. Complete end-to-end type safety covering all 20 evidence specifications, claim states (Supported, Contradicted, Mixed), and audit event schemas.'
  },
  {
    name: 'Vite 6 Bundler & Dev Server',
    desc: 'High-speed build tool with instantaneous Hot Module Replacement (HMR), tree-shaking, and minified production asset pipelines.'
  },
  {
    name: 'Tailwind CSS v4 (CSS-First Design)',
    desc: 'Cyberpunk SOC HUD styling using CSS custom variables and @theme rules. Dark palette (#060913 base) with forensic status badges (Cyan telemetry, Rose contradicted, Amber mixed).'
  },
  {
    name: 'Lucide React Vector Icons',
    desc: 'High-precision iconography powering navigation, threat alert chips, and multi-log inspection triggers.'
  },
  {
    name: 'Interactive SVG Topology Engine',
    desc: 'Custom-engineered reactive relationship graph connecting threat IPs (198.18.7.41, 10.20.4.77), credentials (key-tb-07, bvk-7f3a), systems, and financial changes with interactive node inspectors.'
  },
  {
    name: 'Court-Ready Dossier Generator',
    desc: 'Client-side PDF and report compilation powered by jsPDF and html2canvas with instant export of audit-admissible legal dossiers.'
  }
];

frontendComponents.forEach(item => {
  doc.setFillColor(15, 23, 42);
  doc.circle(margin + 3, y + 2, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(241, 245, 249);
  doc.text(item.name + ':', margin + 6, y + 3);

  const nameWidth = doc.getTextWidth(item.name + ':');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const textLines = doc.splitTextToSize(item.desc, contentWidth - 10);
  doc.text(textLines, margin + 6, y + 7.5);
  y += 7.5 + (textLines.length * 3.8);
});

y += 4;

// SECTION 2: BACKEND & DATA LAYER
doc.setFillColor(15, 23, 42);
doc.roundedRect(margin, y, contentWidth, 7, 1.5, 1.5, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(168, 85, 247); // purple-400
doc.text('2. BACKEND, INGESTION & DATA STORAGE LAYER', margin + 4, y + 5);

y += 11;

const backendComponents = [
  {
    name: 'Python 3 Forensic Ingestion Engine',
    desc: 'Processed over 85,000+ raw entries from 20 authentic case files (CSV, JSON, PDF records) covering LedgerOne API, Helpdeskr, SSO logins, BlueVault S3, and PrivateLink network flow logs.'
  },
  {
    name: 'Chronological Normalization Engine',
    desc: 'Resolves timestamp discrepancies across Unix Epoch seconds (E05 BlueVault), IST UTC+05:30 (E02 Helpdeskr), and ISO UTC (E01 LedgerOne, E15 PrivateLink), producing a unified chronological attack line.'
  },
  {
    name: 'PostgreSQL / Supabase Schema',
    desc: 'Production-ready database definition (supabase_schema.sql) with 7 relational tables, primary/foreign keys, and strict Row Level Security (RLS) policies for legal defense team access.'
  }
];

backendComponents.forEach(item => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(241, 245, 249);
  doc.text(item.name + ':', margin + 6, y + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const textLines = doc.splitTextToSize(item.desc, contentWidth - 10);
  doc.text(textLines, margin + 6, y + 7.5);
  y += 7.5 + (textLines.length * 3.8);
});

drawFooter(1, 2);

// ---------------- PAGE 2 ----------------
doc.addPage();
drawHeader(
  'PROJECT MIRROR - ARCHITECTURE & TECH STACK',
  'AI Forensic Assistant, Rebuttal Logic & Adjudication Pipeline'
);

y = 36;

// SECTION 3: AI & INTELLIGENCE
doc.setFillColor(15, 23, 42);
doc.roundedRect(margin, y, contentWidth, 7, 1.5, 1.5, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(34, 197, 94); // emerald-400
doc.text('3. AI & FORENSIC INTELLIGENCE ENGINE', margin + 4, y + 5);

y += 11;

const aiComponents = [
  {
    name: 'RAG Forensic Question-Answering (Retrieval-Augmented Generation)',
    desc: 'Answers complex investigative questions by grounding responses strictly in verified evidentiary logs, eliminating hallucinations.'
  },
  {
    name: 'Strict 3-Tier Grounding & Disambiguation Engine',
    desc: 'Every analysis explicitly categorizes outputs into:\n  • CONFIRMED FACTS: Backed by specific timestamped rows and evidence IDs (E01-E20).\n  • INVESTIGATIVE ASSUMPTIONS: Deductions and threat actor hypotheses (e.g., credential harvesting via ticket TKT-48213).\n  • MISSING EVIDENCE: Identifies critical forensic gaps (e.g., missing internal host egress and EDR logs).'
  },
  {
    name: 'Automated Sentence-by-Sentence Claim Adjudication',
    desc: 'Extracts assertions from culprit formal notices (E16, E12) and executes automated cross-examination against ground truth logs to calculate mathematical contradiction rates and coverage scores.'
  },
  {
    name: 'Google Stitch MCP & Design System Integration',
    desc: 'Connected to Google Stitch MCP API to generate unified design tokens, tactical visual schemas, and forensic dashboard wireframes.'
  }
];

aiComponents.forEach(item => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(241, 245, 249);
  doc.text(item.name + ':', margin + 6, y + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const textLines = doc.splitTextToSize(item.desc, contentWidth - 10);
  doc.text(textLines, margin + 6, y + 7.5);
  y += 7.5 + (textLines.length * 3.8);
});

y += 6;

// SUMMARY MATRIX TABLE
doc.setFillColor(15, 23, 42);
doc.roundedRect(margin, y, contentWidth, 7, 1.5, 1.5, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(250, 204, 21); // amber-400
doc.text('4. TECHNOLOGY MATRIX SUMMARY', margin + 4, y + 5);

y += 11;

// Table header
doc.setFillColor(30, 41, 59);
doc.rect(margin, y, contentWidth, 7, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(255, 255, 255);
doc.text('Layer', margin + 3, y + 4.5);
doc.text('Technology / Tool', margin + 40, y + 4.5);
doc.text('Forensic Purpose', margin + 95, y + 4.5);

y += 7;

const matrix = [
  ['UI Framework', 'React 19 + TypeScript', 'Reactive state, type safety, modular views'],
  ['Styling', 'Tailwind CSS v4 (SOC HUD)', 'Cyberpunk dark theme, military-grade telemetry styling'],
  ['Visualization', 'Interactive SVG Topology', 'Attack path mapping (IPs, credentials, leaks, fraud)'],
  ['Reporting', 'jsPDF + html2canvas', 'Admissible legal defense dossier export'],
  ['Log Parsing', 'Python 3 Data Pipeline', '85,000+ entries parsed across 20 authentic evidence logs'],
  ['Time Normalizer', 'Custom UTC/IST/Epoch Engine', 'Cross-system timestamp correlation across timezones'],
  ['Database', 'PostgreSQL / Supabase Schema', '7 normalized forensic tables with Row Level Security'],
  ['AI Reasoning', 'RAG Question-Answering', 'Evidence-grounded queries with zero hallucination'],
  ['Truth Verification', 'Fact vs. Assumption Sieve', 'Strict segregation of confirmed facts, hypotheses & gaps'],
  ['Design System', 'Google Stitch MCP', 'AI-assisted design system and component architecture']
];

matrix.forEach((row, idx) => {
  if (idx % 2 === 0) {
    doc.setFillColor(15, 23, 42);
  } else {
    doc.setFillColor(9, 13, 22);
  }
  doc.rect(margin, y, contentWidth, 6, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(56, 189, 248);
  doc.text(row[0], margin + 3, y + 4.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(241, 245, 249);
  doc.text(row[1], margin + 40, y + 4.2);

  doc.setTextColor(148, 163, 184);
  doc.text(row[2], margin + 95, y + 4.2);

  y += 6;
});

drawFooter(2, 2);

// Save output file
const outputPath = path.resolve('..', 'MIRROR_Technology_Stack_and_AI_Architecture.pdf');
const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfBytes));
console.log('PDF successfully created at:', outputPath);
