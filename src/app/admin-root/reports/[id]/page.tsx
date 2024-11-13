"use client";

import { useRouter, useParams } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { FaArrowLeft, FaFilePdf } from "react-icons/fa";
import { sections } from "@/app/register/fields";
import { format } from "date-fns";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const html2pdf = require("html2pdf.js");

export default function TicketDetail() {
  const { id } = useParams();
  const router = useRouter();

  const ticketQuery = trpc.admin.getTicket.useQuery({ id: id as string });

  if (!ticketQuery.data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  const ticket = ticketQuery.data;

  const excludedFields = [
    "external_user_id",
    "id",
    "custom_id",
    "status",
    "terms_accepted",
    "commercial_contract_file_url"
  ];

  const customLabels: Record<string, string> = {
    created_at: "Data de envio",
  };

  const companyFields = [
    "created_at",
    "full_name",
    "email",
    "website",
    "trade_name",
    "legal_name",
    "tax_id",
    "monthly_revenue",
    "incorporation_date",
    "phone",
    "company_email",
    "tax_id_age",
    "partners_count",
    "postal_code",
    "street_address",
    "address_number",
    "district",
    "address_type",
    "country",
    "state",
    "city",
    "area_code",
    "additional_info",
    "reference_point",
  ];

  const partnerFields = [
    "partner_social_id",
    "partner_full_name",
    "partner_email",
    "partner_phone",
    "partner_birth_date",
    "partner_mother_name",
    "partner_father_name",
    "partner_gender",
    "partner_nationality",
    "partner_document_rg",
    "partner_address_street",
    "partner_address_number",
    "partner_address_district",
    "partner_address_zipcode",
    "partner_address_city",
    "partner_address_state",
  ];

  const pdfFields = [
    "contract_file_url",
    "balance_file_url",
    "address_proof_file_url",
    "selfie_file_url",
    "identity_file_url",
    "commercial_contract_file_url",
  ];

  const getFieldMetadata = (name: string) => {
    if (customLabels[name]) {
      return { label: customLabels[name] };
    }
    for (const section of sections) {
      for (const field of section.fields) {
        if (field.name === name) {
          return field;
        }
      }
    }
    return null;
  };

  const formatValue = (key: string, value: any) => {
    if (
      ["incorporation_date", "created_at", "partner_birth_date"].includes(
        key
      ) &&
      value
    ) {
      return format(new Date(value), "dd/MM/yyyy");
    }

    if (key === "tax_id" && typeof value === "string") {
      return value.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5"
      );
    }
    if (key === "partner_social_id" && typeof value === "string") {
      return value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
    }
    return value;
  };

  const exportToPDF = () => {
    const element = document.getElementById("ticket-details");
    html2pdf()
      .set({
        filename: `Ticket_${id}.pdf`,
        margin: [10, 10],
        html2canvas: { scale: 4 },
      })
      .from(element)
      .save();
  };

  const renderFields = (fields: string[]) =>
    Object.entries(ticket)
      .filter(([key]) => fields.includes(key) && !excludedFields.includes(key))
      .map(([key, value]) => {
        const metadata = getFieldMetadata(key);
        const formattedValue = formatValue(key, value);

        return (
          <div key={key} className="flex flex-col py-3">
            <label className="text-gray-500 font-semibold mb-1">
              {metadata ? metadata.label : key.replace(/_/g, " ")}:
            </label>
            {key.endsWith("url") ? (
              <a
                href={value as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                <FaFilePdf className="inline mr-2" />
                Ver PDF
              </a>
            ) : (
              <input
                readOnly
                value={formattedValue}
                className="w-full px-4 py-2 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none"
              />
            )}
          </div>
        );
      });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button
        onClick={() => router.push("/admin-root/reports")}
        className="text-blue-600 font-semibold hover:underline flex items-center mb-4"
      >
        <FaArrowLeft className="mr-2" />
        Voltar para relatórios
      </button>

      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Detalhes do Ticket
      </h1>

      <div
        id="ticket-details"
        className="bg-white shadow-lg rounded-2xl p-8 text-gray-700"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Dados da Empresa
        </h2>
        {renderFields(companyFields)}

        <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">
          Dados do Sócio
        </h2>
        {renderFields(partnerFields)}

        <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">PDFS</h2>
        {renderFields(pdfFields)}
      </div>

      <button
        onClick={exportToPDF}
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all"
      >
        Exportar como PDF
      </button>
    </div>
  );
}
