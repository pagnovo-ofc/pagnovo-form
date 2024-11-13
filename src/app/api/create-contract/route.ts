import { NextResponse } from "next/server";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs from "fs";
import { randomUUID } from "crypto";
import mammoth from "mammoth";
import { PDFDocument, rgb } from "pdf-lib";
import { put } from "@vercel/blob";
import path from "path";

export async function POST(request: Request): Promise<NextResponse> {
  const input = await request.json();

  async function generateContract(variables: any): Promise<Buffer | null> {
    try {
      // Carrega o conteúdo do arquivo DOCX diretamente como buffer
      const content = fs.readFileSync(
        path.join(
          process.cwd(),
          "public",
          "contract",
          "contracts",
          "cloud",
          "doc",
          "contrato.docx"
        ),
        "binary"
      );
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: "[", end: "]" },
      });

      const sanitizedVariables: any = {};
      for (const [key, value] of Object.entries(variables)) {
        if (value !== undefined) {
          sanitizedVariables[key] = value;
        }
      }

      doc.setData(sanitizedVariables);
      doc.render();
      return doc.getZip().generate({ type: "nodebuffer" });
    } catch (error) {
      console.error("Error generating contract:", error);
      return null;
    }
  }

  async function convertDocxToPdf(docxBuffer: Buffer): Promise<Buffer> {
    const { value: htmlContent } = await mammoth.convertToHtml({
      buffer: docxBuffer,
    });
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);

    page.drawText(htmlContent, {
      x: 50,
      y: 750,
      size: 12,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  const variables = {
    company_name: input.legal_name,
    company_address_street: input.street_address,
    company_address_number: input.address_number,
    company_address_district: input.district,
    company_address_zipcode: input.postal_code,
    company_address_city: input.city,
    company_address_state: input.state,
    company_cnpj: input.tax_id,
    partner_document_rg: input.partner_document_rg,
    partner_document_cpf: input.partner_social_id,
    partner_address_street: input.partner_address_street,
    partner_address_number: input.partner_address_number,
    partner_address_district: input.partner_address_district,
    partner_address_zipcode: input.partner_address_zipcode,
    partner_address_city: input.partner_address_city,
    partner_address_state: input.partner_address_state,
    partner_full_name: input.partner_full_name,
    created_at_day: new Date().getDate().toString().padStart(2, "0"),
    created_at_month: new Date().toLocaleString("pt-BR", { month: "long" }),
    created_at_year: new Date().getFullYear().toString(),
  };

  const docxBuffer = await generateContract(variables);
  if (!docxBuffer) {
    return NextResponse.json(
      { error: "Error generating contract" },
      { status: 500 }
    );
  }

  const pdfBuffer = await convertDocxToPdf(docxBuffer);
  const pdfUpload = await put(
    `contratos/${input.legal_name}-${randomUUID()}.pdf`,
    pdfBuffer,
    { access: "public" }
  );

  return NextResponse.json({ url: pdfUpload.url });
}
