// Specification Extensions
import {
    ExternalDocumentationObject,
    HeaderObject,
    ParameterObject,
    PathItemObject,
    PathsObject,
    RequestBodyObject,
    ResponseObject,
} from './paths';
import { SchemaObject } from './schema';
import { SecurityRequirementObject, SecuritySchemeObject } from './security';

// Any object may carry extra fields whose names start with "x-".
export type Extensions = {
    [key: `x-${string}`]: unknown;
};

// Reference
export type ReferenceObject = {
    $ref: string;
};

export type Ref<T> = ReferenceObject | T;

export const isReference = (value: unknown): value is ReferenceObject =>
    typeof value === 'object' && value !== null && '$ref' in value;

// Components
export type ComponentsObject = Extensions & {
    callbacks?: Record<string, Ref<CallbackObject>>;
    examples?: Record<string, Ref<ExampleObject>>;
    headers?: Record<string, Ref<HeaderObject>>;
    links?: Record<string, Ref<LinkObject>>;
    parameters?: Record<string, Ref<ParameterObject>>;
    requestBodies?: Record<string, Ref<RequestBodyObject>>;
    responses?: Record<string, Ref<ResponseObject>>;
    schemas?: Record<string, Ref<SchemaObject>>;
    securitySchemes?: Record<string, Ref<SecuritySchemeObject>>;
};

// Callbacks
export type CallbackObject = Extensions & {
    [expression: string]: PathItemObject;
};

export type ExampleObject = Extensions & {
    description?: string;
    externalValue?: string;
    summary?: string;
    value?: unknown;
};

export type LinkObject = Extensions & {
    description?: string;
    operationId?: string;
    operationRef?: string;
    parameters?: Record<string, unknown>;
    requestBody?: unknown;
    server?: ServerObject;
};

// Based on the OpenAPI v3.0.3 specification:
// https://spec.openapis.org/oas/v3.0.3.html#openapi-object
export type OpenAPIObject = Extensions & {
    components?: ComponentsObject;
    externalDocs?: ExternalDocumentationObject;
    info: InfoObject;
    openapi: string;
    paths: PathsObject;
    security?: SecurityRequirementObject[];
    servers?: ServerObject[];
    tags?: TagObject[];
};

export type InfoObject = Extensions & {
    contact?: ContactObject;
    description?: string;
    license?: LicenseObject;
    termsOfService?: string;
    title: string;
    version: string;
};

export type ContactObject = Extensions & {
    email?: string;
    name?: string;
    url?: string;
};

export type LicenseObject = Extensions & {
    name: string;
    url?: string;
};

export type ServerObject = Extensions & {
    description?: string;
    url: string;
    variables?: Record<string, ServerVariableObject>;
};

export type ServerVariableObject = Extensions & {
    default: string;
    description?: string;
    enum?: string[];
};

export type TagObject = Extensions & {
    description?: string;
    externalDocs?: ExternalDocumentationObject;
    name: string;
};
