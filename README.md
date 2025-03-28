# Nested Object Validation for TypeScript

## Introduction

`simple-validation` is a lightweight and flexible TypeScript library designed for validating deeply nested objects. It
provides a simple API to define and enforce validation rules, ensuring data integrity and consistency.

## Features

- Validate deeply nested objects with custom rules
- Support for synchronous and asynchronous validation
- TypeScript-friendly with full type inference
- Custom error messages and validation logic
- Easily extensible and configurable

## Methods

- `result` : result validated form state
- `resetValidate` : reset field invalid on change or all
- `setNestedValue` : use for setting state in nested object
- `onSubmit` : function for submitting form
- `onBlurValidate` : function for blur event trigger
- `passed` : result of form validation

## Pattern

- `number`
- `email`
- `url`
- `required`
- `min`
- `max`
- `minLength`
- `maxLength`
- `regex`

## Installation

```sh
npm install simple-validation
```

or using yarn:

```sh
yarn add simple-validation
```

## Usage

### Basic Example

```typescript
import {validate} from 'simple-validation';
import {useCallback, useState} from "react";

// create form type
interface DataForm {
    name: string;
    person: {
        age: number;
        name: number;
    }
}

const [formState, setFormState] = useState<Partial<DataForm>>({})
const {onSubmit, result, resetValidate, setNestedValue, onBlurValidate} = useValidate<DataForm>({
    scrollToField: true,
    rules: {
        name: {required: true, minLength: 5},
        person: {
            age: {required: true, message: "Person age is required"},
            name: {required: true, minLength: 5},
        }
    }
});

const onChange = useCallback((name: keyof DataForm, value: unknown) => {
    setFormState((prev) => setNestedValue(prev, name, value));
}, [])
```
## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

MIT

