import type { InstructionInputValueNode } from '@codama/nodes';

// OpenAPI version this renderer targets
// per the spec: https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#openapi-object
export const OPENAPI_VERSION = '3.0.3';

// Accounts the backend fills in itself, so they're not in the request
// lists the Codama `default value` meaning "the address is already known", d
// derived from seeds (PDA), a fixed address, the program itself, or the wallet paying or signing
// TODO it is not well tested with various of programs
export const RESOLVED_BY_BACKEND: InstructionInputValueNode['kind'][] = [
    'pdaValueNode',
    'publicKeyValueNode',
    'programIdValueNode',
    'payerValueNode',
    'identityValueNode',
];