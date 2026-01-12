export type FormData = {
    name: string;
    email: string;
    phone: string;
    annualIncome: string;
    budget: string;
    interestArea: string;
    message: string;
};

export const INITIAL_DATA: FormData = {
    name: "",
    email: "",
    phone: "",
    annualIncome: "",
    budget: "",
    interestArea: "domestic",
    message: "",
};
