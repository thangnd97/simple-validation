import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {BlockStack, Button, TextField} from "@shopify/polaris";
import {useValidate} from "../lib/validation.ts";
import {useCallback, useState} from "react";

type DEMO_STATE = {
    name: string;
    person: {
        age: string;
        name: string;
    }
}

function App() {
    const {onSubmit, result, resetValidate, setNestedValue, onBlurValidate} = useValidate<DEMO_STATE>({
        scrollToField: true,
        rules: {
            name: {required: true, minLength: 5},
            person: {
                age: {required: true, message: "Tên người dùng bắt buộc"},
                name: {required: true, minLength: 5},
            }
        }
    });

    const [formState, setFormState] = useState<Partial<DEMO_STATE>>({});
    const onChange = useCallback((value: unknown, name: keyof DEMO_STATE) => {
        resetValidate(name)
        setFormState((prev) => setNestedValue(prev, name, value))
    }, [])
    const onFinish = useCallback(async () => {
        const valid = await onSubmit(formState);
        console.log(valid)
    }, [formState])

    return (
        <>
            <div>
                <a href="https://vite.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo"/>
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo"/>
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <BlockStack gap="200">
                    <TextField
                        id='name'
                        value={formState.name}
                        requiredIndicator
                        onBlur={onBlurValidate}
                        onChange={onChange}
                        error={result.name}
                        label='Name' autoComplete='off'/>

                    <TextField
                        id='person.age'
                        error={result.person?.age}
                        value={formState.person?.age}
                        requiredIndicator
                        onBlur={onBlurValidate}
                        onChange={onChange}
                        label='Age' autoComplete='off'/>
                    <TextField
                        id='person.name'
                        requiredIndicator
                        value={formState.person?.name}
                        error={result.person?.name}
                        onBlur={onBlurValidate}
                        onChange={onChange}
                        label='Person name' autoComplete='off'/>

                    <Button onClick={onFinish} variant='primary'>Submit</Button>
                </BlockStack>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}

export default App
