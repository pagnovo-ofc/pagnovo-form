"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileDropZone } from "./components/FileDropZone";
import { sections, formSchema } from "./fields"; // import the zod schema
import { trpc } from "@/utils/trpc";
import toast from "react-hot-toast";

interface FileData {
  name: string;
  data: File;
}

interface FormData {
  [key: string]: string | number | boolean | FileData[] | null;
}

export default function CompanyDataForm() {
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTicket = trpc.ticket.createTicketWithoutAcquiring.useMutation({
    onSuccess: (customId) => {
      router.push(`/register/success/${customId}`);
    },
    onError: (error) => {
      toast.error(
        "Erro ao enviar os dados. Verifique as informações e tente novamente."
      );
      console.error("Mutation error:", error);
    },
  });

  const formatCurrencyMask = (value: string): string => {
    // Remove todos os caracteres que não são números
    const numericValue = value.replace(/\D/g, "");

    // Aplica a máscara de moeda com "R$", milhar e centavos
    const maskedValue = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(numericValue) / 100);

    return maskedValue;
  };

  const applyMask = (value: string, mask: string): string => {
    let maskedValue = "";
    let valueIndex = 0;

    for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
      if (mask[i] === "9") {
        maskedValue += value[valueIndex];
        valueIndex++;
      } else {
        maskedValue += mask[i];
      }
    }
    return maskedValue;
  };

  const formatInputValue = (name: string, value: string): string => {
    const field = sections
      .flatMap((section) => section.fields)
      .find((field) => field.name === name);

    if (!field || field.type === "select" || field.type === "file")
      return value; // Field not found
    if (field.isCurrency) return formatCurrencyMask(value); // Currency mask
    const mask = field.mask;
    if (!mask) return value; // No mask defined for this field

    const numericValue = value.replace(/\D/g, "").slice(0, mask.length); // Only digits, respecting max length
    return applyMask(numericValue, mask);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    const formattedValue =
      type === "text" ? formatInputValue(name, value) : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? e.target.checked : formattedValue,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "", // Clear the error for the field once user starts typing
    }));
  };

  const handleFileDrop = async (acceptedFiles: File[], fieldName: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: acceptedFiles.map((file) => ({
        name: file.name,
        data: file,
      })),
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: "", // Clear error for file input
    }));
  };

  const handleFileRemove = (fieldName: string, index: number) => {
    setFormData((prevData) => {
      const updatedFiles = (
        prevData[fieldName as keyof typeof formData] as FileData[]
      ).filter((_, i) => i !== index);
      return { ...prevData, [fieldName]: updatedFiles };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const arrayItens = [];

      // Processa campos que contêm arquivos para upload
      for (const [field, value] of Object.entries(formData)) {
        if (Array.isArray(value) && value[0]?.data) {
          const file = value[0].data;

          const response = await fetch(
            `/api/upload?filename=${encodeURIComponent(file.name)}`,
            {
              method: "POST",
              body: file,
            }
          );

          if (!response.ok) {
            toast.error("Erro ao enviar os arquivos. Tente novamente.");
            setIsSubmitting(false);
            return;
          }

          const data = await response.json();
          arrayItens.push({
            name: field,
            value: data.url,
          });
        } else {
          arrayItens.push({
            name: field,
            value: value,
          });
        }
      }

      // Adiciona a URL do PDF de commercial_contract_file_url
      // console.log("entrando aqui")
      // const pdfResponse = await fetch("/api/create-contract", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ ...formData }), // Enviar dados necessários
      // });

      // console.log(pdfResponse);

      // if (!pdfResponse.ok) {
      //   console.log("naaaao passei");
      //   throw new Error("Erro ao gerar contrato PDF");
      // }

      // const pdfData = await pdfResponse.json();
      // arrayItens.push({
      //   name: "commercial_contract_file_url",
      //   value: pdfData.url,
      // });

      // console.log("pdfData", pdfData);

      // Valida o formData com o schema Zod
      const validationResult = formSchema.safeParse(
        arrayItens.reduce((acc, item) => {
          acc[item.name] = item.value;
          return acc;
        }, {} as FormData)
      );

      if (!validationResult.success) {
        for (const error of validationResult.error.errors) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [error.path.join(".")]: error.message,
          }));
        }

        toast.error("Erro de validação. Verifique os dados e tente novamente.");
        setIsSubmitting(false);
        return;
      }

      // Se os dados estão válidos, chama a função para criar o ticket
      createTicket.mutate(validationResult.data);
    } catch (error) {
      console.error("Erro ao processar o formulário:", error);
      toast.error(
        "Ocorreu um erro ao processar o formulário. Tente novamente."
      );
    }

    setIsSubmitting(false);
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-fixed bg-cover"
      style={{ backgroundImage: "url(/bg2.png)" }}
    >
      <div className="max-w-2xl my-8">
        <div className="w-full my-8 p-8 bg-[#010e21] text-white rounded-lg shadow-lg">
          <div className="flex flex-col items-center">
            <Image
              width={80}
              height={80}
              src="/logo.png"
              alt="Logo AxisBanking"
              className="w-24 h-24 mb-4"
            />
            <h2 className="text-center text-3xl font-semibold mb-2">
              Registro AxisBanking
            </h2>
          </div>
          <p className="text-center text-white">
            Para ser aprovado no sistema, preencha todos os dados da empresa
            abaixo. Essas informações são essenciais para validar seu registro e
            garantir a conformidade com as políticas da plataforma.
          </p>
        </div>

        {sections.map((section) => (
          <div
            key={section.title}
            className="mb-8 w-full my-8 p-8 bg-white text-black rounded-lg shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-700 mb-4">
              {section.title}
            </h3>
            {section.fields.map((field) =>
              field.type === "file" ? (
                <div key={field.name} className="mt-5">
                  <label className="block text-gray-700 font-semibold">
                    {field.label}
                  </label>
                  <p className="text-sm text-gray-500 mb-2">
                    {field.description}
                  </p>
                  <FileDropZone
                    onDrop={(files) => handleFileDrop(files, field.name)}
                    accept={field.accept}
                    files={
                      (
                        formData[
                          field.name as keyof typeof formData
                        ] as FileData[]
                      )?.map((fileData) => ({
                        name: fileData.name,
                        previewUrl: URL.createObjectURL(
                          new Blob([fileData.data])
                        ),
                      })) || []
                    }
                    onRemove={(index) => handleFileRemove(field.name, index)}
                    uploading={false}
                  />
                  {errors[field.name] && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              ) : field.type === "checkbox" ? (
                <div
                  key={field.name}
                  className="flex items-center mt-5 space-x-3"
                >
                  <input
                    type="checkbox"
                    name={field.name}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor={field.name}
                    className="text-gray-700 font-medium"
                  >
                    {field.description}
                  </label>
                  {errors[field.name] && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              ) : (
                <div key={field.name} className="mt-5">
                  <label className="block text-gray-700 font-semibold mb-1">
                    {field.label}
                  </label>
                  <p className="text-sm text-gray-500 mb-2">
                    {field.description}
                  </p>
                  {field.type === "select" ? (
                    <select
                      name={field.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Selecione uma opção
                      </option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === "date" ? "date" : "text"}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={
                        formData[field.name as keyof typeof formData] as
                          | string
                          | number
                      }
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring focus:ring-gray-300"
                    />
                  )}
                  {errors[field.name] && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        ))}

        <div className="mb-8 w-full my-8 p-8 bg-white text-black rounded-lg shadow-lg">
          <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:animate-pulse disabled:cursor-wait"
            disabled={createTicket.isPending || isSubmitting}
            onClick={handleSubmit}
          >
            {createTicket.isPending || isSubmitting
              ? "Enviando..."
              : "Enviar dados"}
          </button>
        </div>
      </div>
    </div>
  );
}
