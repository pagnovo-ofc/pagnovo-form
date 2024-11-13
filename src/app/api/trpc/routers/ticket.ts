import { publicProcedure, t } from "../trpc-router";
import { z } from "zod";
import prisma from "@/lib/prisma";
import axios from "axios";

export const ticketRouter = t.router({
  createTicket: publicProcedure
    .input(
      z.object({
        // Personal Data
        full_name: z.string().min(1, "Full name is required"),
        email: z.string().email("Invalid email format"),

        // Company Data
        website: z.string().url("Invalid website URL"),
        trade_name: z.string().min(1, "Trade name is required"),
        legal_name: z.string().min(1, "Legal name is required"),
        tax_id: z.string().regex(/^\d{14}$/, "Invalid CNPJ format"),
        monthly_revenue: z.string().min(1, "Monthly revenue is required"),
        incorporation_date: z.string().datetime(),
        phone: z.string().min(10, "Phone number must have at least 10 digits"),
        company_email: z.string().email("Invalid company email format"),
        tax_id_age: z.number().min(0, "Tax ID age must be a positive integer"),
        partners_count: z
          .number()
          .int()
          .min(1, "At least 1 partner is required"),

        // Address Data
        postal_code: z
          .string()
          .regex(/^\d{5}-\d{3}$/, "Invalid postal code format"),
        street_address: z.string().min(1, "Street address is required"),
        address_number: z.string().min(1, "Address number is required"),
        district: z.string().min(1, "District is required"),
        address_type: z.string().min(1, "Address type is required"),
        country: z.string().min(1, "Country is required"),
        state: z.string().length(2, "State must be the two-letter code"),
        city: z.string().min(1, "City is required"),
        area_code: z.string().regex(/^\d+$/, "Area code should be numeric"),
        additional_info: z.string().optional(),
        reference_point: z.string().optional(),

        // Terms and Conditions
        terms_accepted: z
          .boolean()
          .refine((val) => val === true, "Terms must be accepted"),

        // Partner Data (optional fields for a partner)
        partner_social_id: z.string().regex(/^\d{11}$/, "Invalid CPF format"),
        partner_full_name: z.string(),
        partner_email: z.string().email(),
        partner_phone: z.string().min(10),
        partner_birth_date: z.string().datetime(),
        partner_mother_name: z.string(),
        partner_father_name: z.string(),
        partner_gender: z.enum(["Masculino", "Feminino"]),
        partner_nationality: z.string(),
        partner_document_rg: z
          .string()
          .regex(/^\d{2}\.\d{3}\.\d{3}-\d{1}$/, "Invalid RG format"),
        partner_address_street: z.string(),
        partner_address_number: z.string(),
        partner_address_district: z.string(),
        partner_address_zipcode: z
          .string()
          .regex(/^\d{5}-\d{3}$/, "Invalid Zipcode format"),
        partner_address_city: z.string(),
        partner_address_state: z.string().length(2, "Invalid state format"),

        // Files URLs (files are uploaded separately)
        contract_file_url: z.string().url("Invalid URL format"),
        balance_file_url: z.string().url("Invalid URL format"),
        address_proof_file_url: z.string().url("Invalid URL format"),
        selfie_file_url: z.string().url("Invalid URL format"),
        identity_file_url: z.string().url("Invalid URL format"),
        // commercial_contract_file_url: z.string().url("Invalid URL format"),
      })
    )
    .mutation(async ({ input }) => {
      const custom_id = "AX" + Date.now().toString(36).substring(2, 9);

      const response = await axios.post(
        "https://api.pagnovo.com/kyc/create-enterprise",
        {
          address: "São Paulo",
          cep: "11111-111",
          cityAndState: `São Paulo/SP`,
          document: input.tax_id,
          partnerDocument: input.partner_social_id,
          email: input.email,
          name: input.legal_name,
          phone: input.phone,
          status: "ANALYSING"
        },
        {
          headers: {
            Authorization: `KYC KaT92zI5hiMnAoH-kyc-4d2loe872462qobvoi3y80lait3b3k`,
          },
        }
      );

      await prisma.ticket.create({
        data: {
          ...input,
          custom_id,
          external_user_id: response.data.userId,
        },
      });

      return custom_id;
    }),

  getTicket: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await prisma.ticket.findUnique({
        where: {
          custom_id: input.id,
        },
      });
    }),
});
