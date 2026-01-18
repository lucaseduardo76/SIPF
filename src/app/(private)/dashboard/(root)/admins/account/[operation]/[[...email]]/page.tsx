"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mail, Phone, SquareUserRound } from "lucide-react";

import { PageHeader } from "@/src/components/ui/PageHeader";
import { Button } from "@/src/components/ui/Button";
import { AvatarEditor } from "@/src/components/ui/AvatarEditor";
import { InputField } from "@/src/components/ui/InputField";
import { ScrollableArea } from "@/src/components/ui/ScrollableArea";
import { getAdminUser, userUpdate, registerAdmin } from "@/src/api/endpoints/user";
import { useAvatarUpload } from "@/src/utils/useAvatarUpload";

type Operation = "create" | "edit";

type FormState = {
    name: string;
    email: string;
    profileImageUrl?: string | null;
    phone: string,
    cpf?: string,
};

export default function CaensAccountUpsertPage() {
    const router = useRouter();
    const params = useParams<{ operation: string; email?: string[] }>();
    const [file, setFile] = useState<File>();
    const [error, setError] = useState<string | null>(null);
    const uploadAvatar = useAvatarUpload().uploadAvatar;

    const operation = (params?.operation as Operation) ?? "create";
    const emailFromRoute = params?.email?.[0] ?? null;

    const isEdit = operation === "edit";

    const title = isEdit ? "Editar conta da CAENS" : "Nova conta da CAENS";
    const primaryLabel = isEdit ? "Registrar alterações" : "Registrar conta";

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<FormState>({
        name: "",
        email: "",
        profileImageUrl: null,
        phone: "",
        cpf: "",
    });

    const emailDisabled = isEdit;
    const handleImageUpload = (newAvatar: File): void => {
        setFile(newAvatar);
    }

    useEffect(() => {
        if (!isEdit) return;

        if (!emailFromRoute) {
            router.replace("/dashboard/admins/account/create");
            return;
        }

        setLoading(true);
        (async () => {
            try {
                const admin = await getAdminUser(emailFromRoute);

                setForm({
                    name: admin.name ?? "",
                    email: admin.email ?? "",
                    profileImageUrl: admin.profileImageUrl ?? null,
                    phone: admin.phone,
                });

            } finally {
                setLoading(false);
            }
        })();
    }, [isEdit, emailFromRoute, router]);

    const canSubmit = useMemo(() => {
        return Boolean(form.name.trim() && form.email.trim());
    }, [form.name, form.email]);

    const onSubmit = async () => {
        if (!canSubmit || loading) return;

        setError(null);
        setLoading(true);

        try {
            if (isEdit) {
                await userUpdate({ name: form.name, phone: form.phone }, form.email);
            } else {
                await registerAdmin({
                    name: form.name,
                    phone: form.phone,
                    email: form.email,
                    cpf: form.cpf as string,
                });

                if (file) {
                    await uploadAvatar(file as File, true, form.email);
                }
            }

            router.refresh();
            router.back();
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Não foi possível salvar. Tente novamente.";

            setError(msg);
        } finally {
            setLoading(false);
        }
    };



    return (
        <main className="min-h-0 flex flex-col px-4">
            <PageHeader title={title} goBack />

            <ScrollableArea className="flex-1">
                <div className="min-h-[75dvh] flex flex-col md:w-[50%]">
                    <AvatarEditor
                        currentAvatar={form.profileImageUrl}
                        adminEmail={form.email}
                        handleImageUpload={handleImageUpload}
                    />

                    <div className="flex flex-col gap-4 mt-5">
                        <InputField
                            value={form.name}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, name: e.target.value }))
                            }
                            label="Nome completo"
                            placeholder="Nome completo do servidor da CAENS"
                            disabled={loading}
                        />

                        <InputField
                            value={form.email}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, email: e.target.value }))
                            }
                            label="Email institucional"
                            placeholder="Email institucional"
                            icon={<Mail className="w-3.5 h-3.5" />}
                            disabled={loading || emailDisabled}
                        />

                        <InputField
                            value={form.phone}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, phone: e.target.value }))
                            }
                            label="Telefone"
                            placeholder="Telefone de contato"
                            icon={<Phone className="w-3.5 h-3.5" />}
                            disabled={loading}
                        />

                        {!isEdit && (
                            <InputField
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, cpf: e.target.value }))
                                }
                                label="CPF"
                                placeholder="Cadastro de pessoa física"
                                icon={<SquareUserRound className="w-3.5 h-3.5" />}
                                disabled={loading}
                            />
                        )}

                        {!isEdit && (
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Será enviado para o e-mail informado um link para <br />
                                escolha de uma senha segura.
                            </p>
                        )}

                        {error && (
                            <div
                                className={[
                                    "mb-3 rounded-xl border px-4 py-3 text-sm",
                                    "border-red-200 bg-red-50 text-red-700",
                                    "dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200",
                                ].join(" ")}
                            >
                                {error}
                            </div>
                        )}

                    </div>

                    <div className="mt-auto flex flex-col gap-3">
                        <Button
                            variant="tertiary"
                            onClick={() => router.back()}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="primary"
                            onClick={onSubmit}
                            disabled={!canSubmit || loading}
                        >
                            {primaryLabel}
                        </Button>
                    </div>
                </div>
            </ScrollableArea>
        </main>
    );
}
