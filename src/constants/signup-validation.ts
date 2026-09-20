export type CompanySignupValues = {
    companyName: string;
    legalName: string;
    taxId: string;
    phone: string;
    industry: string;
  };
  
  export type AdminSignupValues = {
    adminName: string;
    adminEmail: string;
    password: string;
  };
  
  export function onlyDigits(value: string) {
    return value.replace(/\D/g, "");
  }
  
  export function formatCnpj(value: string) {
    const digits = onlyDigits(value).slice(0, 14);
  
    return digits
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  
  export function formatPhone(value: string) {
    const digits = onlyDigits(value).slice(0, 11);
  
    if (digits.length <= 10) {
      return digits
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
  
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  }
  
  export function isCompanyFormValid(
    values: CompanySignupValues,
  ) {
    return (
      values.companyName.trim().length >= 2 &&
      values.legalName.trim().length >= 2 &&
      onlyDigits(values.taxId).length === 14 &&
      onlyDigits(values.phone).length >= 10 &&
      values.industry.trim().length >= 2
    );
  }
  
  export function isAdminFormValid(
    values: AdminSignupValues,
  ) {
    return Boolean(
      values.adminName.trim().length >= 2 &&
        values.adminEmail.includes("@") &&
        values.adminEmail.includes(".") &&
        values.password.length >= 8,
    );
  }
  
  