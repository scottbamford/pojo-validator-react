import * as React from "react";
import { ValidationErrors, Validator, ValidationCallback, ValidationState } from "pojo-validator";

/**
 * Hook that provides a validate method and its associated validationErrors as a state object managed by validation.
 * 
 * validation is a callback that is working on a known model, with appropriate deps supplied.  This means it does not receive
 * a model to be checked as a passed in argument in the same way useValidator() does.
 * 
 * @param validating the validation method.
 */
export function useValidatorCallback(validating: (validation: ValidationState, fieldsToCheck?: Array<string>) => void, deps: React.DependencyList): [(fieldsToCheck?: Array<string>) => boolean, ValidationErrors] {
    const [validationErrors, setValidationErrors] = React.useState<ValidationErrors>({});

    // Create a ValidationCallback that ignores the model it receives and uses model that we get passed in as a dependency.
    const validatingModel = React.useCallback((model: any, validation: ValidationState, fieldsToCheck?: Array<string>): void => {
        return validating(validation, fieldsToCheck);
    }, deps);

    // Create the method in the right format for us to return it so we can call validate() directly.
    const validate = React.useCallback((fieldsToCheck?: Array<string>): boolean => {
        let validator = new Validator(validatingModel);
        const ok = validator.validate({} /* Model is ignored by our validation code so we pass an empty object */, fieldsToCheck);

        setValidationErrors({
            ...validationErrors,
            ...validator.errors()
        });

        return ok;
    }, [...deps, validatingModel, validationErrors, setValidationErrors]);

    return [validate, validationErrors];
}
