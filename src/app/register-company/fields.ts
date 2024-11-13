import { Accept } from "react-dropzone";
import { z } from "zod";
import { cpf, cnpj } from "cpf-cnpj-validator";

interface StandardField {
  name: string;
  label: string;
  placeholder?: string;
  description: string;
  mask?: string;
  type?: "text" | "number" | "date" | "checkbox";
  isCurrency?: boolean;
}
interface OptionField {
  name: string;
  label: string;
  placeholder?: string;
  description: string;
  type: "select";
  options: string[];
}

export interface UploadField {
  name: string;
  label: string;
  description: string;
  type: "file";
  accept: Accept;
}

export type FormField = StandardField | UploadField | OptionField;

export interface FormSection {
  title: string;
  fields: FormField[];
}

export type FormSections = FormSection[];

const REGEX_CPF = /[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}/;
const REGEX_CNPJ = /[0-9]{2}\.?[0-9]{3}\.?[0-9]{3}\/?[0-9]{4}\-?[0-9]{2}/;

export const formSchema = z.object({
  // Campos principais
  full_name: z
    .string({
      required_error: "O campo Nome completo é obrigatório",
      invalid_type_error: "Nome completo deve ser um texto",
    })
    .min(1, "O campo Nome completo é obrigatório"),
  email: z
    .string({
      required_error: "O campo E-mail é obrigatório",
      invalid_type_error: "Formato de e-mail inválido",
    })
    .email("Formato de e-mail inválido"),
  website: z
    .string({
      required_error: "O campo URL do site é obrigatório",
      invalid_type_error: "Formato de URL inválido",
    })
    .url("URL do site inválida"),
  trade_name: z
    .string({
      required_error: "O campo Nome fantasia é obrigatório",
      invalid_type_error: "Nome fantasia deve ser um texto",
    })
    .min(1, "O campo Nome fantasia é obrigatório"),
  legal_name: z
    .string({
      required_error: "O campo Razão social é obrigatório",
      invalid_type_error: "Razão social deve ser um texto",
    })
    .min(1, "O campo Razão social é obrigatório"),
  tax_id: z
    .string({
      required_error: "O campo CNPJ é obrigatório",
      invalid_type_error: "Formato de CNPJ inválido",
    })
    .regex(REGEX_CNPJ, "Formato de CNPJ inválido")
    .refine((value) => cnpj.isValid(value), "CNPJ inválido")
    .transform((value) => value.replace(/[^\d]/g, "")),
  monthly_revenue: z
    .string({
      required_error: "O campo Faturamento mensal é obrigatório",
      invalid_type_error: "Faturamento mensal deve ser um texto",
    })
    .min(1, "O campo Faturamento mensal é obrigatório"),
  incorporation_date: z
    .string({
      required_error: "O campo Data de constituição é obrigatório",
      invalid_type_error: "Formato de data inválido",
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de constituição inválida")
    .transform((date) => new Date(date).toISOString()),
  phone: z
    .string({
      required_error: "O campo Telefone é obrigatório",
      invalid_type_error: "Número de telefone deve ser um texto",
    })
    .min(10, "O número de telefone deve ter pelo menos 10 dígitos"),
  company_email: z
    .string({
      required_error: "O campo E-mail da empresa é obrigatório",
      invalid_type_error: "Formato de e-mail inválido",
    })
    .email("Formato de e-mail da empresa inválido"),
  tax_id_age: z
    .string({
      required_error: "O campo Idade do CNPJ é obrigatório",
      invalid_type_error: "A idade do CNPJ deve ser um número",
    })
    .transform((value) => Number(value))
    .refine(
      (value) => !isNaN(value) && value >= 0,
      "A idade do CNPJ deve ser um número positivo"
    ),
  partners_count: z
    .string({
      required_error: "O campo Quantidade de sócios é obrigatório",
      invalid_type_error: "Quantidade de sócios deve ser um número",
    })
    .transform((value) => Number(value))
    .refine(
      (value) => !isNaN(value) && value >= 1,
      "É necessário ter pelo menos 1 sócio"
    ),
  postal_code: z
    .string({
      required_error: "O campo CEP é obrigatório",
      invalid_type_error: "Formato de CEP inválido",
    })
    .regex(/^\d{5}-?\d{3}$/, "Formato de CEP inválido"),
  street_address: z
    .string({
      required_error: "O campo Endereço é obrigatório",
      invalid_type_error: "Endereço deve ser um texto",
    })
    .min(1, "O campo Endereço é obrigatório"),
  address_number: z
    .string({
      required_error: "O campo Número do endereço é obrigatório",
      invalid_type_error: "Número do endereço deve ser um texto",
    })
    .min(1, "O campo Número do endereço é obrigatório"),
  district: z
    .string({
      required_error: "O campo Bairro é obrigatório",
      invalid_type_error: "Bairro deve ser um texto",
    })
    .min(1, "O campo Bairro é obrigatório"),
  address_type: z
    .string({
      required_error: "O campo Tipo de endereço é obrigatório",
      invalid_type_error: "Tipo de endereço deve ser um texto",
    })
    .min(1, "O campo Tipo de endereço é obrigatório"),
  country: z
    .string({
      required_error: "O campo País é obrigatório",
      invalid_type_error: "País deve ser um texto",
    })
    .min(1, "O campo País é obrigatório"),
  state: z
    .string({
      required_error: "O campo Estado é obrigatório",
      invalid_type_error: "Estado deve ser um texto",
    })
    .length(2, "Estado deve conter a sigla de 2 letras"),
  city: z
    .string({
      required_error: "O campo Cidade é obrigatório",
      invalid_type_error: "Cidade deve ser um texto",
    })
    .min(1, "O campo Cidade é obrigatório"),
  area_code: z
    .string({
      required_error: "O campo Código de área é obrigatório",
      invalid_type_error: "Código de área deve ser numérico",
    })
    .regex(/^\d+$/, "O código de área deve ser numérico"),
  additional_info: z.string().optional(),
  reference_point: z.string().optional(),
  terms_accepted: z
    .boolean({
      required_error: "É necessário aceitar os termos",
      invalid_type_error: "Aceite os termos para continuar",
    })
    .refine((val) => val === true, "É necessário aceitar os termos"),

  // Campos de dados do sócio
  partner_social_id: z
    .string({
      required_error: "O campo CPF é obrigatório",
      invalid_type_error: "Formato de CPF inválido",
    })
    .regex(REGEX_CPF, "Formato de CPF inválido")
    .refine((value) => cpf.isValid(value), "CPF inválido")
    .transform((value) => value.replace(/[^\d]/g, "")),
  partner_full_name: z
    .string({
      required_error: "O campo Nome completo do sócio é obrigatório",
      invalid_type_error: "Nome completo do sócio deve ser um texto",
    })
    .min(1, "O campo Nome completo do sócio é obrigatório"),
  partner_email: z
    .string({
      required_error: "O campo E-mail do sócio é obrigatório",
      invalid_type_error: "Formato de e-mail inválido",
    })
    .email("Formato de e-mail inválido"),
  partner_phone: z
    .string({
      required_error: "O campo Telefone do sócio é obrigatório",
      invalid_type_error: "Número de telefone deve ser um texto",
    })
    .min(10, "O número de telefone deve ter pelo menos 10 dígitos"),
  partner_birth_date: z
    .string({
      required_error: "O campo Data de nascimento é obrigatório",
      invalid_type_error: "Formato de data inválido",
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de nascimento inválida")
    .transform((date) => new Date(date).toISOString()),
  partner_mother_name: z
    .string({
      required_error: "O campo Nome da mãe do sócio é obrigatório",
      invalid_type_error: "Nome da mãe do sócio deve ser um texto",
    })
    .min(1, "O campo Nome da mãe do sócio é obrigatório"),
  partner_father_name: z
    .string({
      required_error: "O campo Nome do pai do sócio é obrigatório",
      invalid_type_error: "Nome do pai do sócio deve ser um texto",
    })
    .min(1, "O campo Nome do pai do sócio é obrigatório"),
  partner_gender: z.enum(["Masculino", "Feminino"], {
    required_error: "O campo Gênero do sócio é obrigatório",
    invalid_type_error: "Gênero do sócio inválido",
  }),
  partner_nationality: z
    .string({
      required_error: "O campo Nacionalidade do sócio é obrigatório",
      invalid_type_error: "Nacionalidade do sócio deve ser um texto",
    })
    .min(1, "O campo Nacionalidade do sócio é obrigatório"),
  partner_document_rg: z
    .string({
      required_error: "O campo RG é obrigatório",
      invalid_type_error: "Formato de RG inválido",
    })
    .regex(/^\d{2}\.\d{3}\.\d{3}-\d{1}$/, "Formato de RG inválido"),
  partner_address_street: z
    .string({
      required_error: "O campo Endereço do sócio é obrigatório",
      invalid_type_error: "Endereço do sócio deve ser um texto",
    })
    .min(1, "O campo Endereço do sócio é obrigatório"),
  partner_address_number: z
    .string({
      required_error: "O campo Número do endereço do sócio é obrigatório",
      invalid_type_error: "Número do endereço do sócio deve ser um texto",
    })
    .min(1, "O campo Número do endereço do sócio é obrigatório"),
  partner_address_district: z
    .string({
      required_error: "O campo Bairro do sócio é obrigatório",
      invalid_type_error: "Bairro do sócio deve ser um texto",
    })
    .min(1, "O campo Bairro do sócio é obrigatório"),
  partner_address_zipcode: z
    .string({
      required_error: "O campo CEP do sócio é obrigatório",
      invalid_type_error: "Formato de CEP inválido",
    })
    .regex(/^\d{5}-?\d{3}$/, "Formato de CEP inválido"),
  partner_address_city: z
    .string({
      required_error: "O campo Cidade do sócio é obrigatório",
      invalid_type_error: "Cidade do sócio deve ser um texto",
    })
    .min(1, "O campo Cidade do sócio é obrigatório"),
  partner_address_state: z
    .string({
      required_error: "O campo Estado do sócio é obrigatório",
      invalid_type_error: "Estado do sócio deve ser um texto",
    })
    .length(2, "Estado do sócio deve conter a sigla de 2 letras"),

  // Campos de arquivo
  contract_file_url: z
    .string({
      required_error: "O campo URL do contrato é obrigatório",
      invalid_type_error: "Formato de URL inválido",
    })
    .url("Formato de URL inválido"),
  balance_file_url: z
    .string({
      required_error: "O campo URL do balanço é obrigatório",
      invalid_type_error: "Formato de URL inválido",
    })
    .url("Formato de URL inválido"),
  address_proof_file_url: z
    .string({
      required_error: "O campo URL do comprovante de endereço é obrigatório",
      invalid_type_error: "Formato de URL inválido",
    })
    .url("Formato de URL inválido"),
  selfie_file_url: z
    .string({
      required_error: "O campo URL da selfie é obrigatório",
      invalid_type_error: "Formato de URL inválido",
    })
    .url("Formato de URL inválido"),
  identity_file_url: z
    .string({
      required_error: "O campo URL do documento de identidade é obrigatório",
      invalid_type_error: "Formato de URL inválido",
    })
    .url("Formato de URL inválido"),
  // commercial_contract_file_url: z
  //   .string({
  //     required_error: "O campo URL do documento de identidade é obrigatório",
  //     invalid_type_error: "Formato de URL inválido",
  //   })
  //   .url("Formato de URL inválido"),
});

export const sections: FormSections = [
  {
    title: "Dados pessoais",
    fields: [
      {
        name: "full_name",
        label: "Nome",
        placeholder: "Nome completo",
        description: "Informe o seu nome completo.",
      },
      {
        name: "email",
        label: "E-mail",
        placeholder: "Informe seu e-mail",
        description: "Informe um e-mail válido para contato.",
      },
    ],
  },
  {
    title: "Dados da Empresa",
    fields: [
      {
        name: "website",
        label: "Site da Plataforma",
        placeholder: "https://www.suaempresa.com",
        description: "Informe o site da sua empresa ou plataforma principal.",
      },
      {
        name: "trade_name",
        label: "Nome Fantasia",
        placeholder: "Ex: Sua Empresa",
        description: "Nome pelo qual sua empresa é conhecida publicamente.",
      },
      {
        name: "legal_name",
        label: "Razão Social",
        placeholder: "Razão Social Ltda",
        description: "Nome jurídico registrado da sua empresa.",
      },
      {
        name: "tax_id",
        label: "Número do CNPJ",
        placeholder: "00.000.000/0000-00",
        description: "Informe o número do CNPJ da empresa.",
        mask: "99.999.999/9999-99",
      },
      {
        name: "monthly_revenue",
        label: "Faturamento Mensal",
        placeholder: "Ex: R$ 50.000,00",
        description: "Informe o faturamento médio mensal.",
        isCurrency: true,
      },
      {
        name: "incorporation_date",
        label: "Data de Constituição",
        type: "date",
        description: "Data de abertura oficial da empresa.",
      },
      {
        name: "phone",
        label: "Telefone",
        placeholder: "(11) 98765-4321",
        description: "Número de contato principal da empresa.",
        mask: "(99) 99999-9999",
      },
      {
        name: "company_email",
        label: "E-mail",
        placeholder: "contato@suaempresa.com",
        description: "E-mail oficial para contato empresarial.",
      },
      {
        name: "tax_id_age",
        label: "Tempo de Constituição do CNPJ",
        placeholder: "Ex: 5 anos",
        type: "number",
        description: "Informe quantos anos desde a constituição do CNPJ.",
      },
      {
        name: "partners_count",
        label: "Quantidade de Sócios",
        placeholder: "Ex: 3",
        type: "number",
        description: "Informe o número de sócios da empresa.",
      },
      {
        name: "contract_file_url",
        label: "Contrato Social e Última Atualização",
        description:
          "Faça o upload do contrato social com a última atualização.",
        type: "file",
        accept: {
          "application/pdf": [".pdf"],
          "application/msword": [".doc", ".docx"],
        },
      },
      {
        name: "balance_file_url",
        label: "Balanço e Faturamento do Último Período",
        description:
          "Envie o balanço ou previsão de faturamento, conforme aplicável.",
        type: "file",
        accept: {
          "application/pdf": [".pdf"],
          "application/msword": [".doc", ".docx"],
        },
      },
    ],
  },
  {
    title: "Endereço da Empresa",
    fields: [
      {
        name: "postal_code",
        label: "CEP",
        placeholder: "00000-000",
        description: "Informe o CEP da empresa.",
        mask: "99999-999",
      },
      {
        name: "street_address",
        label: "Endereço",
        placeholder: "Ex: Av. Paulista, 1000",
        description: "Informe o endereço completo da empresa.",
      },
      {
        name: "address_number",
        label: "Número",
        placeholder: "Ex: 1000",
        description: "Número do endereço.",
      },
      {
        name: "district",
        label: "Bairro",
        placeholder: "Centro",
        description: "Informe o bairro.",
      },
      {
        name: "address_type",
        label: "Tipo de Endereço",
        placeholder: "Comercial/Residencial",
        description: "Informe o tipo do endereço.",
      },
      {
        name: "country",
        label: "País",
        placeholder: "Ex: Brasil",
        description: "País onde a empresa está localizada.",
      },
      {
        name: "state",
        label: "Estado (Sigla)",
        placeholder: "Ex: SP",
        description: "Estado (UF).",
      },
      {
        name: "city",
        label: "Cidade",
        placeholder: "Ex: São Paulo",
        description: "Cidade onde a empresa está localizada.",
      },
      {
        name: "area_code",
        label: "DDD da Região",
        placeholder: "Ex: 11",
        description: "Código DDD.",
        mask: "999",
      },
      {
        name: "additional_info",
        label: "Complemento",
        placeholder: "Ex: Sala 101",
        description: "Complemento do endereço, se houver.",
      },
      {
        name: "reference_point",
        label: "Ponto de Referência",
        placeholder: "Próximo ao metrô",
        description: "Ponto de referência do endereço.",
      },
      {
        name: "address_proof_file_url",
        label: "Comprovante de Endereço do CNPJ",
        description: "Faça o upload do comprovante de endereço do CNPJ.",
        type: "file",
        accept: {
          "application/pdf": [".pdf"],
          "image/*": [".jpg", ".jpeg", ".png"],
        },
      },
    ],
  },
  {
    title: "Dados dos Sócios",
    fields: [
      {
        name: "partner_social_id",
        label: "CPF",
        placeholder: "000.000.000-00",
        description: "CPF do sócio.",
        mask: "999.999.999-99",
      },
      {
        name: "partner_document_rg",
        label: "RG",
        placeholder: "00.000.000-0",
        description: "RG do sócio.",
        mask: "99.999.999-9",
      },
      {
        name: "partner_full_name",
        label: "Nome do Sócio",
        placeholder: "Nome completo",
        description: "Nome completo do sócio.",
      },
      {
        name: "partner_email",
        label: "E-mail",
        placeholder: "email@socio.com",
        description: "E-mail do sócio.",
      },
      {
        name: "partner_phone",
        label: "Telefone",
        placeholder: "(11) 98765-4321",
        description: "Telefone do sócio.",
        mask: "(99) 99999-9999",
      },
      {
        name: "partner_birth_date",
        label: "Data de Nascimento",
        type: "date",
        description: "Data de nascimento do sócio.",
      },
      {
        name: "partner_mother_name",
        label: "Nome da Mãe",
        placeholder: "Nome completo",
        description: "Nome da mãe do sócio.",
      },
      {
        name: "partner_father_name",
        label: "Nome do Pai",
        placeholder: "Nome completo",
        description: "Nome do pai do sócio.",
      },
      {
        name: "partner_gender",
        label: "Gênero",
        placeholder: "",
        type: "select",
        options: ["Masculino", "Feminino"],
        description: "Gênero do sócio.",
      },
      {
        name: "partner_nationality",
        label: "Nacionalidade",
        placeholder: "Brasileiro",
        description: "Nacionalidade do sócio.",
      },
      {
        name: "selfie_file_url",
        label: "Selfie (Segurando o Documento)",
        description:
          "Faça o upload de uma selfie do sócio segurando o documento.",
        type: "file",
        accept: {
          "image/*": [".jpg", ".jpeg", ".png"],
          "application/pdf": [".pdf"],
        },
      },
      {
        name: "identity_file_url",
        label: "Identidade ou CNH",
        description: "Faça o upload da identidade ou CNH.",
        type: "file",
        accept: {
          "image/*": [".jpg", ".jpeg", ".png"],
          "application/pdf": [".pdf"],
        },
      },
    ],
  },
  {
    title: "Endereço do sócio",
    fields: [
      {
        name: "partner_address_zipcode",
        label: "CEP",
        placeholder: "00000-000",
        description: "Informe o CEP do sócio.",
        mask: "99999-999",
      },
      {
        name: "partner_address_street",
        label: "Endereço",
        placeholder: "Ex: Av. Paulista, 1000",
        description: "Informe o endereço completo do sócio.",
      },
      {
        name: "partner_address_number",
        label: "Número",
        placeholder: "Ex: 1000",
        description: "Número do endereço.",
      },
      {
        name: "partner_address_district",
        label: "Bairro",
        placeholder: "Centro",
        description: "Informe o bairro.",
      },
      {
        name: "partner_address_state",
        label: "Estado (Sigla)",
        placeholder: "Ex: SP",
        description: "Estado (UF).",
      },
      {
        name: "partner_address_city",
        label: "Cidade",
        placeholder: "Ex: São Paulo",
        description: "Cidade do sócio.",
      },
    ],
  },
  {
    title: "Termos e Condições de Uso",
    fields: [
      {
        name: "terms_accepted",
        label: "Aceito os Termos e Condições",
        type: "checkbox",
        description:
          "Ao clicar, você concorda com os Termos e Condições de Uso.",
      },
    ],
  },
];
