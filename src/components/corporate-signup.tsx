import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    formatCnpj,
    formatPhone,
    isAdminFormValid,
    isCompanyFormValid,
    type AdminSignupValues,
    type CompanySignupValues,
} from "@/constants/signup-validation";

type Icon = keyof typeof MaterialCommunityIcons.glyphMap;
type FieldConfig = {
  key: string;
  label: string;
  icon: Icon;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  capitalize?: "none" | "sentences" | "words";
};

const companyFields: FieldConfig[] = [
  { key: "companyName", label: "Nome Fantasia", icon: "domain", capitalize: "words" },
  { key: "legalName", label: "Razão Social", icon: "file-document-outline", capitalize: "words" },
  { key: "taxId", label: "CNPJ ou Doc. Fiscal", icon: "briefcase-outline", keyboardType: "numeric" },
  { key: "phone", label: "Telefone", icon: "phone-outline", keyboardType: "phone-pad" },
  { key: "industry", label: "Ramo de Atuação", icon: "account-group-outline", capitalize: "words" },
];

const adminFields: FieldConfig[] = [
  { key: "adminName", label: "Nome Completo", icon: "account-outline", capitalize: "words" },
  { key: "adminEmail", label: "E-mail Corporativo", icon: "email-outline", keyboardType: "email-address", capitalize: "none" },
  { key: "password", label: "Senha de Acesso", icon: "lock-outline", capitalize: "none" },
];

function Field({
  config,
  value,
  onChange,
  password = false,
  showPassword = false,
  onTogglePassword,
  readOnly = false,
}: {
  config: FieldConfig;
  value: string;
  onChange?: (value: string) => void;
  password?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  readOnly?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <View className="mb-3">
      <Text className="mb-1 text-[10px] font-bold text-foreground">
        {config.label} <Text className="text-error">*</Text>
      </Text>

      <View
        className={
          readOnly
            ? "min-h-[46px] flex-row items-center rounded-xl bg-primary/10 px-3"
            : "min-h-[46px] flex-row items-center rounded-xl bg-background px-3"
        }
      >
        <MaterialCommunityIcons
          name={config.icon}
          size={17}
          color={colors.onSurfaceVariant}
        />

<TextInput
  value={value}
  onChangeText={onChange}
  editable={!readOnly}
  secureTextEntry={password && !showPassword}
  keyboardType={config.keyboardType ?? "default"}
  autoCapitalize={config.capitalize ?? "sentences"}
  autoCorrect={false}
  placeholder={`Digite ${config.label.toLowerCase()}`}
  placeholderTextColor={colors.onSurfaceVariant}
  selectionColor={colors.primary}
  style={{
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
    paddingVertical: 0,
    color: colors.onSurface,
    fontSize: 12,
  }}
/>

        {password ? (
          <Pressable onPress={onTogglePassword} className="p-1">
            <MaterialCommunityIcons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={colors.onSurfaceVariant}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function Steps({ step }: { step: 1 | 2 }) {
  const item = (number: string, title: string, active: boolean) => (
    <View className="flex-row items-center gap-2">
      <View
        className={
          active
            ? "h-6 w-6 items-center justify-center rounded-full bg-primary"
            : "h-6 w-6 items-center justify-center rounded-full bg-background"
        }
      >
        <Text
          className={
            active
              ? "text-[11px] font-extrabold text-white"
              : "text-[11px] font-extrabold text-primary"
          }
        >
          {number}
        </Text>
      </View>

      <View>
        <Text className="text-[10px] font-bold text-foreground">
          {title}
        </Text>
        <Text className="text-[9px] text-muted">
          {number === "1" ? "Organização" : "Acesso Geral"}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="mb-4 mt-5 flex-row items-center">
      {item("1", "Empresa", step === 1)}
      <View
        className={
          step === 2
            ? "mx-2 h-px flex-1 bg-primary"
            : "mx-2 h-px flex-1 bg-border"
        }
      />
      {item("2", "Administrador", step === 2)}
    </View>
  );
}

function SectionTitle({
  step,
  admin,
}: {
  step: 1 | 2;
  admin: boolean;
}) {
  const { colors } = useTheme();

  return (
    <View className="mb-4 flex-row items-center">
      <View className="h-[34px] w-[34px] items-center justify-center rounded-xl bg-primary/10">
        <MaterialCommunityIcons
          name={admin ? "shield-account-outline" : "office-building-outline"}
          size={20}
          color={colors.primary}
        />
      </View>

      <View className="ml-2.5 flex-1">
        <Text className="text-[13px] font-extrabold text-foreground">
          {admin ? "Perfil do Administrador" : "Dados da Empresa"}
        </Text>
        <Text className="text-[9px] text-muted">
          {admin
            ? "Entidade Usuários (Proprietário)"
            : "Entidade Empresas"}
        </Text>
      </View>

      <Text className="rounded-md bg-background px-1.5 py-1 text-[9px] font-bold text-muted">
        Etapa {step}/2
      </Text>
    </View>
  );
}

export function CorporateSignup() {
  const router = useRouter();
  const { colors } = useTheme();

  const [step, setStep] = useState<1 | 2>(1);
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const [company, setCompany] = useState<CompanySignupValues>({
    companyName: "Dubai Software House",
    legalName: "Dubai Software House Desenvolvimento de Softwares",
    taxId: "12.345.678/0001-90",
    phone: "(11) 99999-8888",
    industry: "Desenvolvimento de Software",
  });
  

  const [admin, setAdmin] = useState<AdminSignupValues>({
    adminName: "João Pedro",
    adminEmail: "joaopedro@dubaisoftwarehouse.com.br",
    password: "DubaiSW@2026",
  });

  const updateCompany = (key: string, value: string) => {
    const formatted =
      key === "taxId"
        ? formatCnpj(value)
        : key === "phone"
          ? formatPhone(value)
          : value;

    setCompany((current) => ({ ...current, [key]: formatted }));
  };

  const updateAdmin = (key: string, value: string) => {
    setAdmin((current) => ({ ...current, [key]: value }));
  };

  const next = () => {
    setError("");

    if (!isCompanyFormValid(company)) {
      setError("Preencha todos os dados da empresa.");
      return;
    }

    setStep(2);
  };

  const finish = () => {
    setError("");

    if (!isAdminFormValid(admin)) {
      setError("Confira os dados e use uma senha com 8 caracteres.");
      return;
    }

    if (!terms) {
      setError("Aceite os termos para concluir o cadastro.");
      return;
    }

    setStatus("Cadastro concluído com sucesso.");
    router.replace("/login");
  };

  const goBack = () => {
    if (step === 2) {
      setStep(1);
      setError("");
      return;
    }

    router.canGoBack() ? router.back() : router.replace("/login");
  };

  const values = step === 1 ? company : admin;
  const fields = step === 1 ? companyFields : adminFields;
  const update = step === 1 ? updateCompany : updateAdmin;

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <View className="flex-1 bg-background">
        <View className="h-[58px] flex-row items-center justify-between border-b border-border bg-surface px-3">
          <Pressable
            onPress={goBack}
            className="h-9 w-9 items-center justify-center rounded-xl bg-background"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={20}
              color={colors.primary}
            />
          </Pressable>

          <Text className="text-sm font-semibold text-muted">
            Cadastro de Empresa
          </Text>

          <View className="w-9" />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="grow p-5"
        >
          <Text className="text-[22px] font-extrabold text-foreground">
            Criar Conta Corporativa
          </Text>

          <Text className="mt-1 text-[13px] text-muted">
            {step === 1
              ? "Cadastre sua empresa"
              : "Configure o perfil inicial de Administrador."}
          </Text>

          <Steps step={step} />

          <View className="rounded-2xl border border-border bg-surface p-3.5">
            <SectionTitle step={step} admin={step === 2} />

            {fields.map((field) => (
              <Field
                key={field.key}
                config={field}
                value={String(values[field.key as keyof typeof values] ?? "")}
                onChange={(value) => update(field.key, value)}
                password={field.key === "password"}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword((value) => !value)}
              />
            ))}

            {step === 2 ? (
              <Field
                config={{
                  key: "role",
                  label: "Cargo / Perfil",
                  icon: "account-tie-outline",
                }}
                value="Administrador (Proprietário)"
                readOnly
              />
            ) : null}
          </View>

          <Pressable
            onPress={() => setTerms((value) => !value)}
            className="mt-4 flex-row items-start"
          >
            <View
              className={
                terms
                  ? "h-4 w-4 items-center justify-center rounded border border-primary bg-primary"
                  : "h-4 w-4 rounded border border-primary"
              }
            >
              {terms ? (
                <MaterialCommunityIcons
                  name="check"
                  size={14}
                  color="#FFFFFF"
                />
              ) : null}
            </View>

            <Text className="ml-2 flex-1 text-[9px] text-muted">
              Concordo com os{" "}
              <Text className="font-bold text-primary underline">
                Termos de Uso
              </Text>{" "}
              e a{" "}
              <Text className="font-bold text-primary underline">
                Política de Privacidade
              </Text>
              .
            </Text>
          </Pressable>

          {error ? (
            <Text className="mt-2 text-[10px] text-error">
              {error}
            </Text>
          ) : null}

          {status ? (
            <Text className="mt-2 text-[10px] text-success">
              {status}
            </Text>
          ) : null}

          <Pressable
            onPress={step === 1 ? next : finish}
            className="mt-4 min-h-[46px] flex-row items-center justify-center gap-2 rounded-xl bg-primary"
          >
            <Text className="text-[11px] font-extrabold text-white">
              {step === 1 ? "Cadastrar Empresa" : "Concluir"}
            </Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={18}
              color="#FFFFFF"
            />
          </Pressable>

          <View className="mt-4 flex-row justify-center">
            <Text className="text-[10px] text-muted">
              Já possui uma empresa cadastrada?{" "}
            </Text>
            <Pressable
              onPress={() => router.replace("/login")}
            >
              <Text className="text-[10px] font-bold text-primary underline">
                Fazer Login
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
