import React, {useCallback, useMemo, useState} from "react";

type ResultNested<T> = {
    [K in keyof T]?: T[K] extends object ? ResultNested<T[K]> : string | boolean;
};

type ValidateResult<T> = {
    result: ResultNested<T>;
    setNestedValue: (sate: Partial<T>, name: string, value: unknown) => Partial<T>;
    resetValidate: (name?: keyof T) => void;
    onSubmit: (data: Partial<T>) => Promise<boolean>;
    onBlurValidate: (event: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
    passed: boolean;
};

type ValidatorFunction = (value: any, expect?: any) => boolean;

type ValidatorMap = {
    [key: string]: ValidatorFunction;
};

const message: Record<ValidatorKeys, string> = {
    number: "{{name}} the value must be a valid number.",
    email: "{{name}} invalid email format.",
    url: "{{name}} invalid URL format.",
    required: "{{name}} is required.",
    regex: "{{name}} the value does not match the required pattern.",
    andField: "{{name}} condition not met.",
    min: "{{name}} min value is {{value}}",
    maxLength: "{{name}} max length value is {{value}}",
    max: "{{name}} max value is {{value}}",
    minLength: "{{name}} min length value is {{value}}"
};

const validator: ValidatorMap = {
    maxLength: (value: string, expect: number) => !!value && value.length <= expect,
    minLength: (value: string, expect: number) => !!value && value.length >= expect,
    min: (value: number, expect: number) => (value || 0) >= expect,
    max: (value: number, expect: number) => (value || 0) <= expect,
    number: (value: unknown) => !Number.isNaN(Number(value)),
    email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    url: (value: string) => new RegExp(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).test(value),
    urlWithProtocol: (value: string) => new RegExp('^(https?://)[a-zA-Z0-9.-]+(\\.[a-zA-Z]{2,})?(:\\d+)?(/.*)?$').test(value),
    color: (value: string) => {
        const color = value.startsWith('#') ? value : `#${value}`;
        return new RegExp(/^#?([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6,8})$/).test(color);
    },
    required: (value?: string | null) => {
        if (value === null || value === undefined) return false;
        return new RegExp(/^\s*\S.*$/).test(value);
    },
    regex: (value: any, regex: RegExp | string) => !!value && new RegExp(regex).test(value),
};

type ValidatorKeys = keyof typeof validator;

type RuleItem = {
    [K in ValidatorKeys]?: boolean | number | string | RegExp;
} & { message?: string };

type NestValidateRules<T> = {
    [K in keyof T]?: T[K] extends object ? NestValidateRules<T[K]> : RuleItem;
};

type ValidationOptions<T> = {
    rules: NestValidateRules<T>;
    scrollToField?: boolean;
};

function flattenRules(obj: Record<string, any>, prefix = ""): Record<string, any> {
    return Object.keys(obj).reduce((acc, key) => {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
            const flattened = flattenRules(obj[key], newKey);
            Object.assign(acc, flattened);
        } else {
            if (!acc[prefix]) acc[prefix] = {};
            acc[prefix][key] = obj[key];
        }

        return acc;
    }, {} as Record<string, any>);
}

const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((acc, key) => (acc && acc[key] ? acc[key] : undefined), obj);
};

const setNestedValue = <T>(obj: T, path: string, value: unknown) => {
    const keys = path.split(".");
    let current: any = obj;
    keys.forEach((key: string, index: number) => {
        if (index === keys.length - 1) {
            current[key] = value;
        } else {
            current[key] = current[key] || {};
            current = current[key];
        }
    });
    return obj;
};

export function useValidate<T>(options: ValidationOptions<Required<T>>): ValidateResult<Required<T>> {
    const [result, setResult] = useState<ResultNested<T>>({});
    const flatRules = useMemo(() => flattenRules(options.rules), [options.rules]);
    const resetValidate = useCallback((name?: keyof T) => {
        setResult((prev) => {
            if (name) {
                const newState = {...prev};
                return setNestedValue<ResultNested<T>>(newState, name as string, false);
                // return newState;
            }
            return {};
        });
    }, []);

    const passed = useMemo(() => {
        return Object.values(result).every((item) => !item);
    }, [result]);

    const onValidation = useCallback((value: unknown, name: keyof T) => {
        const rules = flatRules[name as string];
        const label = document.querySelector(`label[for="${String(name)}"]`) as HTMLLabelElement;

        if (!rules) return true;
        for (const key in rules) {
            const msg: string = key === "message" && rules[key] ? rules[key] : message[key];
            const errorMsg = msg.replace('{{name}}', label?.innerText || name as string).replace('{{value}}', rules[key])
            if (key === "message" || !(key in validator)) continue;
            const validate = validator[key as ValidatorKeys];
            if (validate) {
                const isValid = validate(value, rules[key]);
                setResult((prev) => {
                    const newState = {...prev};
                    return setNestedValue<ResultNested<T>>(newState, name as string, isValid ? false : errorMsg);
                    // return newState;
                });
                if (options.scrollToField && !isValid) {
                    document.getElementById(String(name))?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
                if (!isValid) return false;
            }
        }
        return true;
    }, [flatRules]);

    const onBlurValidate = useCallback((event: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
            const {id, name, value} = event.target;
            onValidation(value, (name || id) as keyof T);
        },
        [onValidation]
    );

    const onSubmit = useCallback(async (state: Partial<T>) => {
        let isValid = true;
        for (const key in flatRules) {
            isValid = onValidation(getNestedValue(state, key), key as keyof T)
        }
        return isValid;
    }, [onValidation, options.rules]);
    return {result, resetValidate, setNestedValue, onSubmit, onBlurValidate, passed};
}
